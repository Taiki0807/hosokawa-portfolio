import { unstable_cache } from 'next/cache'
import { and, asc, desc, eq, gt, inArray, lt } from 'drizzle-orm'
import { getDb } from '@/lib/db/client'
import { certTargets, goals, learningEntries, learningSessions } from '@/lib/db/schema'
import { CACHE_TAGS } from '@/lib/cache-tags'
import type { DayTotal } from './stats'
import type { SessionRecord } from './goals'

// 公開ページ用の取得関数。D1 は HTTP 経由で遅いため、1 回のクエリで取得して JS で集計し、
// unstable_cache に乗せる。記録の公開・更新時に updateTag / revalidateTag で再検証する。
// 「今日」に依存する計算はキャッシュの外（呼び出し側）で行う。

export type PublicSession = { tag: string; memo: string; minutes: number }

export type PublicEntry = {
  date: string
  title: string
  minutes: number
  sessions: PublicSession[]
  reportText: string
  reportAiPolished: boolean
  hasNote: boolean
}

export type PublicLearningData = {
  /** 公開・非公開（時間のみ表示）の記録の日ごとの合計 */
  days: DayTotal[]
  /** 集計用のセッション（タグ・時間のみ） */
  sessions: SessionRecord[]
  /** 内容まで公開している記録（新しい順） */
  entries: PublicEntry[]
}

// 'private' は内容（メモ・レポート・ノート）を出さず、時間だけ草と統計に反映する
const COUNTED_STATUSES = ['published', 'private'] as const

export async function readPublicLearningData(): Promise<PublicLearningData> {
  const rows = await getDb()
    .select({
      entryId: learningEntries.id,
      date: learningEntries.date,
      status: learningEntries.status,
      title: learningEntries.title,
      reportText: learningEntries.reportText,
      reportAiPolished: learningEntries.reportAiPolished,
      noteMd: learningEntries.noteMd,
      tag: learningSessions.tag,
      memo: learningSessions.memo,
      minutes: learningSessions.minutes,
    })
    .from(learningEntries)
    .innerJoin(learningSessions, eq(learningSessions.entryId, learningEntries.id))
    .where(inArray(learningEntries.status, [...COUNTED_STATUSES]))
    .orderBy(desc(learningEntries.date), asc(learningSessions.sort), asc(learningSessions.id))

  const dayMap = new Map<string, number>()
  const sessions: SessionRecord[] = []
  const entries = new Map<number, PublicEntry>()

  for (const r of rows) {
    dayMap.set(r.date, (dayMap.get(r.date) ?? 0) + r.minutes)
    sessions.push({ date: r.date, tag: r.tag, minutes: r.minutes })
    if (r.status !== 'published') continue
    let entry = entries.get(r.entryId)
    if (!entry) {
      entry = {
        date: r.date,
        title: r.title,
        minutes: 0,
        sessions: [],
        reportText: r.reportText,
        reportAiPolished: r.reportAiPolished,
        hasNote: r.noteMd.trim().length > 0,
      }
      entries.set(r.entryId, entry)
    }
    entry.minutes += r.minutes
    entry.sessions.push({ tag: r.tag, memo: r.memo, minutes: r.minutes })
  }

  return {
    days: [...dayMap].map(([date, minutes]) => ({ date, minutes })),
    sessions,
    entries: [...entries.values()],
  }
}

export const getPublicLearningData = unstable_cache(readPublicLearningData, ['learning-public'], {
  tags: [CACHE_TAGS.learning],
})

export type PublicEntryDetail = PublicEntry & {
  noteMd: string
  updatedAt: string
  prevDate: string | null
  nextDate: string | null
}

export async function readPublishedEntry(date: string): Promise<PublicEntryDetail | null> {
  const db = getDb()
  const published = eq(learningEntries.status, 'published')
  const [rows, prev, next] = await db.batch([
    db
      .select({
        id: learningEntries.id,
        title: learningEntries.title,
        reportText: learningEntries.reportText,
        reportAiPolished: learningEntries.reportAiPolished,
        noteMd: learningEntries.noteMd,
        updatedAt: learningEntries.updatedAt,
        tag: learningSessions.tag,
        memo: learningSessions.memo,
        minutes: learningSessions.minutes,
      })
      .from(learningEntries)
      .leftJoin(learningSessions, eq(learningSessions.entryId, learningEntries.id))
      .where(and(eq(learningEntries.date, date), published))
      .orderBy(asc(learningSessions.sort), asc(learningSessions.id)),
    db
      .select({ date: learningEntries.date })
      .from(learningEntries)
      .where(and(lt(learningEntries.date, date), published))
      .orderBy(desc(learningEntries.date))
      .limit(1),
    db
      .select({ date: learningEntries.date })
      .from(learningEntries)
      .where(and(gt(learningEntries.date, date), published))
      .orderBy(asc(learningEntries.date))
      .limit(1),
  ])
  if (rows.length === 0) return null

  const first = rows[0]
  const sessions = rows.flatMap((r) =>
    r.tag == null || r.minutes == null
      ? []
      : [{ tag: r.tag, memo: r.memo ?? '', minutes: r.minutes }]
  )
  return {
    date,
    title: first.title,
    minutes: sessions.reduce((sum, s) => sum + s.minutes, 0),
    sessions,
    reportText: first.reportText,
    reportAiPolished: first.reportAiPolished,
    hasNote: first.noteMd.trim().length > 0,
    noteMd: first.noteMd,
    updatedAt: first.updatedAt,
    prevDate: prev[0]?.date ?? null,
    nextDate: next[0]?.date ?? null,
  }
}

export const getPublishedEntry = unstable_cache(readPublishedEntry, ['learning-entry'], {
  tags: [CACHE_TAGS.learning],
})

export type GoalRow = typeof goals.$inferSelect
export type CertTargetRow = typeof certTargets.$inferSelect

export async function readGoalsData() {
  const db = getDb()
  const [goalRows, certRows] = await db.batch([
    db.select().from(goals).orderBy(asc(goals.sort), asc(goals.id)),
    db.select().from(certTargets).orderBy(asc(certTargets.sort), asc(certTargets.id)),
  ])
  return { goals: goalRows, certTargets: certRows }
}

export const getGoalsData = unstable_cache(readGoalsData, ['goals'], {
  tags: [CACHE_TAGS.goals],
})
