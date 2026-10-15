import { describe, expect, it } from 'vitest'
import { addDays, dayOfWeek, diffDays, formatDateJa, isIsoDate, toJstDate } from './date'

describe('toJstDate', () => {
  it('UTC 14:59 は JST の同日、15:00 は翌日になる', () => {
    expect(toJstDate(new Date('2026-10-14T14:59:59Z'))).toBe('2026-10-14')
    expect(toJstDate(new Date('2026-10-14T15:00:00Z'))).toBe('2026-10-15')
  })
  it('年をまたぐ', () => {
    expect(toJstDate(new Date('2025-12-31T15:00:00Z'))).toBe('2026-01-01')
  })
})

describe('日付の計算', () => {
  it('うるう年の 2/29 をまたぐ', () => {
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29')
    expect(addDays('2028-02-29', 1)).toBe('2028-03-01')
    expect(addDays('2027-02-28', 1)).toBe('2027-03-01')
    expect(diffDays('2028-01-01', '2029-01-01')).toBe(366)
  })
  it('曜日（0 = 日曜）', () => {
    expect(dayOfWeek('2026-10-18')).toBe(0)
    expect(dayOfWeek('2026-10-15')).toBe(4)
  })
  it('存在しない日付は不正', () => {
    expect(isIsoDate('2027-02-29')).toBe(false)
    expect(isIsoDate('2028-02-29')).toBe(true)
    expect(isIsoDate('2026-1-1')).toBe(false)
  })
  it('日本語表記', () => {
    expect(formatDateJa('2026-10-14')).toBe('2026年10月14日（水）')
  })
})
