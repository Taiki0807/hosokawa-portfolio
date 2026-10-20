'use server'

import { eq, sql } from 'drizzle-orm'
import { updateTag } from 'next/cache'
import { z } from 'zod'
import { ActionError, ownerAction } from '@/lib/admin/action'
import { getEntryIdByDate } from '@/lib/admin/learning'
import { getDb } from '@/lib/db/client'
import { learningEntries, learningSessions } from '@/lib/db/schema'
import { CACHE_TAGS } from '@/lib/cache-tags'
import { entryInputSchema, resolveEntryStatus, sessionInputSchema } from '@/lib/learning/schema'
import { isIsoDate } from '@/lib/learning/date'
import { readSettings } from '@/lib/settings'
import { getAiProvider, AiError } from '@/lib/ai'
import { polishReport } from '@/lib/ai/polish-report'
import { AI_RATE_LIMIT, hitRateLimit } from '@/lib/rate-limit'

export const saveEntry = ownerAction(entryInputSchema, async (input) => {
  const settings = await readSettings()
  const { status, blockedByReview } = resolveEntryStatus(input, settings.publish.publishOnSave)

  const existingId = await getEntryIdByDate(input.date)
  if (existingId && existingId !== input.id) {
    throw new ActionError(`${input.date} の記録はすでにあります。記録一覧から編集してください。`)
  }

  const db = getDb()
  const values = {
    date: input.date,
    title: input.title,
    status,
    noteMd: input.noteMd,
    reportText: input.reportText,
    // レポートが空なら AI 整形の表示も不要
    reportAiPolished: input.reportText ? input.reportAiPolished : false,
  }
  // 新規でも更新でも、セッションは日付から記録を引いて 1 回のバッチで書く（D1 ではバッチが原子的）
  const entryIdByDate = sql<number>`(SELECT ${learningEntries.id} FROM ${learningEntries} WHERE ${learningEntries.date} = ${input.date})`
  const sessionRows = input.sessions.map((s, sort) => ({ ...s, sort, entryId: entryIdByDate }))

  let id: number
  if (input.id) {
    const [updated] = await db.batch([
      db
        .update(learningEntries)
        .set(values)
        .where(eq(learningEntries.id, input.id))
        .returning({ id: learningEntries.id }),
      db.delete(learningSessions).where(eq(learningSessions.entryId, input.id)),
      db.insert(learningSessions).values(sessionRows),
    ])
    if (!updated[0]) throw new ActionError('記録が見つかりませんでした。')
    id = updated[0].id
  } else {
    const [inserted] = await db.batch([
      db.insert(learningEntries).values(values).returning({ id: learningEntries.id }),
      db.insert(learningSessions).values(sessionRows),
    ])
    id = inserted[0].id
  }

  updateTag(CACHE_TAGS.learning)
  return { id, status, blockedByReview, date: input.date }
})

export const deleteEntry = ownerAction(
  z.object({ id: z.number().int().positive() }),
  async ({ id }) => {
    const db = getDb()
    await db.batch([
      db.delete(learningSessions).where(eq(learningSessions.entryId, id)),
      db.delete(learningEntries).where(eq(learningEntries.id, id)),
    ])
    updateTag(CACHE_TAGS.learning)
    return { id }
  }
)

/** 記録フォームで日付を選んだときに、その日の記録がすでにあるかを返す */
export const findEntryByDate = ownerAction(
  z.object({ date: z.string().refine(isIsoDate) }),
  async ({ date }) => ({ id: await getEntryIdByDate(date) })
)

const polishInputSchema = z.object({
  date: z.string().refine(isIsoDate),
  sessions: z.array(sessionInputSchema).min(1).max(10),
  noteMd: z.string().max(20000).default(''),
})

export const polishEntryReport = ownerAction(polishInputSchema, async (input, owner) => {
  const settings = await readSettings()
  if (!settings.ai.enabled) throw new ActionError('AI整形はオフになっています（公開とAIの設定）。')
  if (
    !(await hitRateLimit(`ai:${owner.login}`, AI_RATE_LIMIT.limit, AI_RATE_LIMIT.windowSeconds))
  ) {
    throw new ActionError(
      'AI の利用回数の上限に達しました（1時間に10回まで）。時間をおいてお試しください。'
    )
  }
  try {
    const text = await polishReport(getAiProvider(), input, settings.ai)
    return { text }
  } catch (err) {
    if (err instanceof AiError) throw new ActionError(err.message)
    throw err
  }
})
