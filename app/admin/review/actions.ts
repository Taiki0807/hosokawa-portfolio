'use server'

import { randomUUID } from 'crypto'
import { and, eq, inArray } from 'drizzle-orm'
import { updateTag } from 'next/cache'
import { z } from 'zod'
import { ActionError, ownerAction } from '@/lib/admin/action'
import { buildReviewContext } from '@/lib/admin/review'
import { getAiProvider, AiError } from '@/lib/ai'
import { generateReview, REVIEW_SOURCES } from '@/lib/ai/generate-review'
import { getDb } from '@/lib/db/client'
import { REVIEW_PERSONAS, REVIEW_TAGS, reviewComments } from '@/lib/db/schema'
import { CACHE_TAGS } from '@/lib/cache-tags'
import { AI_RATE_LIMIT, hitRateLimit } from '@/lib/rate-limit'
import { readSettings } from '@/lib/settings'
import { safeEvidenceHref } from '@/lib/review/queries'

export const generateReviewDrafts = ownerAction(
  z.object({ persona: z.enum(REVIEW_PERSONAS), sources: z.array(z.enum(REVIEW_SOURCES)).min(1) }),
  async ({ persona, sources }, owner) => {
    const settings = await readSettings()
    if (!settings.ai.enabled) throw new ActionError('AI はオフになっています（公開とAIの設定）。')
    if (
      !(await hitRateLimit(`ai:${owner.login}`, AI_RATE_LIMIT.limit, AI_RATE_LIMIT.windowSeconds))
    ) {
      throw new ActionError(
        'AI の利用回数の上限に達しました（1時間に10回まで）。時間をおいてお試しください。'
      )
    }
    const ctx = await buildReviewContext()
    let drafts
    try {
      drafts = await generateReview(getAiProvider(), ctx, persona, sources)
    } catch (err) {
      if (err instanceof AiError) throw new ActionError(err.message)
      throw err
    }
    // 生成結果は非公開で保存し、本人が確認・編集してから公開する
    const batchId = randomUUID()
    const generatedAt = new Date().toISOString()
    await getDb()
      .insert(reviewComments)
      .values(
        drafts.map((d, sort) => ({ ...d, persona, sort, batchId, generatedAt, published: false }))
      )
    return { batchId }
  }
)

export const publishReview = ownerAction(
  z.object({
    persona: z.enum(REVIEW_PERSONAS),
    comments: z
      .array(
        z.object({
          id: z.number().int().positive(),
          tag: z.enum(REVIEW_TAGS),
          title: z.string().trim().min(1).max(60),
          text: z.string().trim().min(1).max(600),
          published: z.boolean(),
        })
      )
      .max(10),
  }),
  async ({ persona, comments }) => {
    const db = getDb()
    const ids = comments.map((c) => c.id)
    const owned = ids.length
      ? await db
          .select({ id: reviewComments.id, evidence: reviewComments.evidence })
          .from(reviewComments)
          .where(and(eq(reviewComments.persona, persona), inArray(reviewComments.id, ids)))
      : []
    if (owned.length !== ids.length)
      throw new ActionError('コメントが見つかりませんでした。再読み込みしてください。')
    const now = new Date().toISOString()
    const statements = [
      // この目線で公開中のものを下げてから、選んだものだけを公開する
      db
        .update(reviewComments)
        .set({ published: false })
        .where(eq(reviewComments.persona, persona)),
      ...comments.map((c) => {
        const evidence = (owned.find((o) => o.id === c.id)?.evidence ?? []).filter((e) =>
          safeEvidenceHref(e.href)
        )
        return db
          .update(reviewComments)
          .set({
            tag: c.tag,
            title: c.title,
            text: c.text,
            evidence,
            published: c.published,
            publishedAt: c.published ? now : null,
          })
          .where(eq(reviewComments.id, c.id))
      }),
    ]
    await db.batch(statements as unknown as Parameters<typeof db.batch>[0])
    updateTag(CACHE_TAGS.review)
    return { published: comments.filter((c) => c.published).length }
  }
)
