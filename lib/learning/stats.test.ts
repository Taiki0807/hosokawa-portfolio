import { describe, expect, it } from 'vitest'
import { computeStats, minutesToHours } from './stats'
import { toJstDate } from './date'

const d = (date: string, minutes: number) => ({ date, minutes })

describe('computeStats', () => {
  it('データが空なら全部 0', () => {
    expect(computeStats([], '2026-10-15')).toEqual({
      studyDays: 0,
      totalMinutes: 0,
      currentStreak: 0,
      longestStreak: 0,
    })
  })

  it('学習した日数・合計時間（同じ日は合算、0 分は数えない）', () => {
    const s = computeStats(
      [d('2026-10-01', 30), d('2026-10-01', 15), d('2026-10-02', 0), d('2026-10-03', 60)],
      '2026-10-15'
    )
    expect(s.studyDays).toBe(2)
    expect(s.totalMinutes).toBe(105)
  })

  it('期間の開始日より前は日数・時間に含めない', () => {
    const s = computeStats([d('2025-10-15', 60), d('2025-10-16', 60)], '2026-10-15', '2025-10-16')
    expect(s.studyDays).toBe(1)
    expect(s.totalMinutes).toBe(60)
  })

  it('未来の日付は無視する', () => {
    const s = computeStats([d('2026-10-16', 60)], '2026-10-15')
    expect(s.studyDays).toBe(0)
  })

  it('今日も記録があれば今日から数える', () => {
    const s = computeStats(
      [d('2026-10-13', 10), d('2026-10-14', 10), d('2026-10-15', 10)],
      '2026-10-15'
    )
    expect(s.currentStreak).toBe(3)
  })

  it('今日がまだ未記録でも、昨日まで続いていれば途切れない', () => {
    const s = computeStats([d('2026-10-13', 10), d('2026-10-14', 10)], '2026-10-15')
    expect(s.currentStreak).toBe(2)
  })

  it('昨日も記録がなければ 0', () => {
    const s = computeStats([d('2026-10-12', 10), d('2026-10-13', 10)], '2026-10-15')
    expect(s.currentStreak).toBe(0)
    expect(s.longestStreak).toBe(2)
  })

  it('最長の連続日数（並びが順不同でも正しい）', () => {
    const s = computeStats(
      [
        d('2026-01-05', 10),
        d('2026-01-01', 10),
        d('2026-01-03', 10),
        d('2026-01-02', 10),
        d('2026-01-07', 10),
      ],
      '2026-10-15'
    )
    expect(s.longestStreak).toBe(3)
  })

  it('うるう年の 2/29 をはさんでも連続する', () => {
    const s = computeStats(
      [d('2028-02-28', 10), d('2028-02-29', 10), d('2028-03-01', 10)],
      '2028-03-01'
    )
    expect(s.currentStreak).toBe(3)
    expect(s.longestStreak).toBe(3)
  })

  it('平年の 2/28 → 3/1 は連続する', () => {
    const s = computeStats([d('2027-02-28', 10), d('2027-03-01', 10)], '2027-03-01')
    expect(s.currentStreak).toBe(2)
  })

  it('タイムゾーン境界：UTC では前日でも JST の今日として連続に数える', () => {
    // 2026-10-14T15:30Z は JST 2026-10-15 00:30
    const today = toJstDate(new Date('2026-10-14T15:30:00Z'))
    expect(today).toBe('2026-10-15')
    const s = computeStats([d('2026-10-14', 30), d('2026-10-15', 30)], today)
    expect(s.currentStreak).toBe(2)
  })

  it('年をまたいで連続する', () => {
    const s = computeStats([d('2025-12-31', 10), d('2026-01-01', 10)], '2026-01-01')
    expect(s.currentStreak).toBe(2)
  })
})

describe('minutesToHours', () => {
  it('小数 1 桁に丸める', () => {
    expect(minutesToHours(0)).toBe(0)
    expect(minutesToHours(100)).toBe(1.7)
    expect(minutesToHours(13320)).toBe(222)
  })
})
