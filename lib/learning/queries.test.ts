import { beforeEach, describe, expect, it } from 'vitest'
import { learningEntries, learningSessions, skills } from '@/lib/db/schema'
import { useTestDb } from '@/tests/helpers/test-db'
import { readPublicLearningData, readPublishedEntry } from './queries'
import type { Db } from '@/lib/db/client'

let db: Db

async function addEntry(
  date: string,
  status: 'draft' | 'published' | 'private',
  sessions: [string, number][]
) {
  const [e] = await db
    .insert(learningEntries)
    .values({ date, status, title: date, noteMd: status === 'published' ? '# note' : '' })
    .returning({ id: learningEntries.id })
  await db
    .insert(learningSessions)
    .values(
      sessions.map(([tag, minutes], sort) => ({
        entryId: e.id,
        tag,
        minutes,
        sort,
        memo: `${tag}のメモ`,
      }))
    )
}

beforeEach(async () => {
  db = useTestDb()
  await addEntry('2026-10-01', 'published', [
    ['AWS', 30],
    ['Next.js', 45],
  ])
  await addEntry('2026-10-02', 'private', [['GCP', 60]])
  await addEntry('2026-10-03', 'draft', [['Docker', 90]])
  await addEntry('2026-10-04', 'published', [['AWS', 20]])
})

describe('readPublicLearningData', () => {
  it('下書きは含めず、非公開は時間だけ反映する', async () => {
    const data = await readPublicLearningData()
    expect(data.days.sort((a, b) => a.date.localeCompare(b.date))).toEqual([
      { date: '2026-10-01', minutes: 75 },
      { date: '2026-10-02', minutes: 60 },
      { date: '2026-10-04', minutes: 20 },
    ])
    expect(data.entries.map((e) => e.date)).toEqual(['2026-10-04', '2026-10-01'])
    expect(data.entries[1].sessions.map((s) => s.tag)).toEqual(['AWS', 'Next.js'])
    expect(data.sessions.some((s) => s.tag === 'Docker')).toBe(false)
  })
})

describe('readPublishedEntry', () => {
  it('公開済みの記録と、前後の公開済みの日付を返す', async () => {
    const e = await readPublishedEntry('2026-10-04')
    expect(e).toMatchObject({ minutes: 20, prevDate: '2026-10-01', nextDate: null, hasNote: true })
  })
  it('非公開・下書きは返さない', async () => {
    expect(await readPublishedEntry('2026-10-02')).toBeNull()
    expect(await readPublishedEntry('2026-10-03')).toBeNull()
  })
})

describe('データ移行', () => {
  it('data.ts のスキルが入っている', async () => {
    const rows = await db.select().from(skills)
    expect(rows.map((r) => r.name)).toContain('Next.js')
    expect(rows.every((r) => r.years === null)).toBe(true)
  })
})
