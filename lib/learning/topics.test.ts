import { describe, expect, it } from 'vitest'
import { domainBreakdown, tagTotals } from './topics'

describe('tagTotals / domainBreakdown', () => {
  const sessions = [
    { date: '2026-10-01', tag: 'AWS', minutes: 60 },
    { date: '2026-10-02', tag: 'AWS', minutes: 30 },
    { date: '2026-10-02', tag: 'Next.js', minutes: 60 },
    { date: '2026-10-03', tag: '読書', minutes: 30 },
    { date: '2024-01-01', tag: 'AWS', minutes: 999 },
  ]

  it('期間内のタグ別合計を多い順に', () => {
    expect(tagTotals(sessions, '2025-10-16', '2026-10-15')).toEqual([
      { tag: 'AWS', minutes: 90 },
      { tag: 'Next.js', minutes: 60 },
      { tag: '読書', minutes: 30 },
    ])
  })

  it('領域にまとめ、未分類は「その他」', () => {
    const b = domainBreakdown(tagTotals(sessions, '2025-10-16', '2026-10-15'))
    const byId = Object.fromEntries(b.map((d) => [d.domain.id, d]))
    expect(byId.cloud.minutes).toBe(90)
    expect(byId.frontend.minutes).toBe(60)
    expect(byId.other.minutes).toBe(30)
    expect(b.reduce((s, d) => s + d.ratio, 0)).toBeCloseTo(1)
  })

  it('データがなければ「その他」は出さない', () => {
    expect(domainBreakdown([]).some((d) => d.domain.id === 'other')).toBe(false)
  })
})
