import 'server-only'
import { and, count, desc, eq, inArray, or, sql, type SQL } from 'drizzle-orm'
import { getDb } from '@/lib/db/client'
import { learningEntries, learningSessions, type EntryStatus } from '@/lib/db/schema'
import { computeStats } from '@/lib/learning/stats'
import { monthOf, todayJst } from '@/lib/learning/date'

export const PAGE_SIZE = 20

export type AdminEntryRow = {
  id: number
  date: string
  title: string
  status: EntryStatus
  reportAiPolished: boolean
  minutes: number
  tags: string[]
  memo: string
}

function escapeLike(q: string) {
  return q.replace(/[\\%_]/g, (c) => `\\${c}`)
}

export async function listEntries(opts: { q?: string; status?: EntryStatus; page?: number }) {
  const db = getDb()
  const page = Math.max(1, opts.page ?? 1)
  const conds: SQL[] = []
  if (opts.status) conds.push(eq(learningEntries.status, opts.status))
  if (opts.q) {
    const pattern = `%${escapeLike(opts.q)}%`
    conds.push(
      or(
        sql`${learningEntries.title} LIKE ${pattern} ESCAPE '\\'`,
        sql`${learningEntries.id} IN (SELECT ${learningSessions.entryId} FROM ${learningSessions} WHERE ${learningSessions.memo} LIKE ${pattern} ESCAPE '\\' OR ${learningSessions.tag} LIKE ${pattern} ESCAPE '\\')`
      )!
    )
  }
  const where = conds.length ? and(...conds) : undefined

  const [totalRows, entries] = await db.batch([
    db.select({ n: count() }).from(learningEntries).where(where),
    db
      .select()
      .from(learningEntries)
      .where(where)
      .orderBy(desc(learningEntries.date))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
  ])
  const ids = entries.map((e) => e.id)
  const sessions = ids.length
    ? await db.select().from(learningSessions).where(inArray(learningSessions.entryId, ids))
    : []

  const rows: AdminEntryRow[] = entries.map((e) => {
    const s = sessions.filter((x) => x.entryId === e.id).sort((a, b) => a.sort - b.sort)
    return {
      id: e.id,
      date: e.date,
      title: e.title,
      status: e.status,
      reportAiPolished: e.reportAiPolished,
      minutes: s.reduce((sum, x) => sum + x.minutes, 0),
      tags: [...new Set(s.map((x) => x.tag))],
      memo: s
        .map((x) => x.memo)
        .filter(Boolean)
        .join(' / '),
    }
  })
  const total = totalRows[0]?.n ?? 0
  return { rows, total, page, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) }
}

export async function getEntry(id: number) {
  const db = getDb()
  const [entries, sessions] = await db.batch([
    db.select().from(learningEntries).where(eq(learningEntries.id, id)),
    db
      .select()
      .from(learningSessions)
      .where(eq(learningSessions.entryId, id))
      .orderBy(learningSessions.sort),
  ])
  const entry = entries[0]
  return entry ? { ...entry, sessions } : null
}

export async function getEntryIdByDate(date: string) {
  const [row] = await getDb()
    .select({ id: learningEntries.id })
    .from(learningEntries)
    .where(eq(learningEntries.date, date))
  return row?.id ?? null
}

export async function getOverview() {
  const db = getDb()
  const today = todayJst()
  const [dayRows, statusRows, recent] = await db.batch([
    db
      .select({
        date: learningEntries.date,
        minutes: sql<number>`sum(${learningSessions.minutes})`,
      })
      .from(learningEntries)
      .innerJoin(learningSessions, eq(learningSessions.entryId, learningEntries.id))
      .where(inArray(learningEntries.status, ['published', 'private']))
      .groupBy(learningEntries.date),
    db
      .select({ status: learningEntries.status, n: count() })
      .from(learningEntries)
      .groupBy(learningEntries.status),
    db.select().from(learningEntries).orderBy(desc(learningEntries.date)).limit(5),
  ])
  const days = dayRows.map((d) => ({ date: d.date, minutes: Number(d.minutes) }))
  const stats = computeStats(days, today)
  const month = monthOf(today)
  const byStatus = Object.fromEntries(statusRows.map((r) => [r.status, r.n])) as Partial<
    Record<EntryStatus, number>
  >
  const todayEntry = recent.find((e) => e.date === today) ?? null
  return {
    today,
    todayEntry,
    currentStreak: stats.currentStreak,
    monthStudyDays: days.filter((d) => monthOf(d.date) === month && d.minutes > 0).length,
    draftCount: byStatus.draft ?? 0,
    publishedCount: byStatus.published ?? 0,
    recent,
  }
}

/** 記録フォームのタグ候補：よく使うタグ順 + 既定の候補 */
export async function getTagSuggestions(defaults: string[]) {
  const rows = await getDb()
    .select({ tag: learningSessions.tag, n: count() })
    .from(learningSessions)
    .groupBy(learningSessions.tag)
    .orderBy(desc(count()))
    .limit(30)
  return [...new Set([...rows.map((r) => r.tag), ...defaults])]
}
