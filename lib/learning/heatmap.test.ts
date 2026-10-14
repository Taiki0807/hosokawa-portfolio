import { describe, expect, it } from 'vitest'
import { buildHeatmap, minutesToLevel } from './heatmap'
import { dayOfWeek } from './date'

describe('minutesToLevel', () => {
  it.each([
    [0, 0],
    [-5, 0],
    [1, 1],
    [29, 1],
    [30, 2],
    [59, 2],
    [60, 3],
    [119, 3],
    [120, 4],
    [600, 4],
  ])('%i 分 → 段階 %i', (minutes, level) => {
    expect(minutesToLevel(minutes)).toBe(level)
  })
})

describe('buildHeatmap', () => {
  const end = '2026-10-15' // 木曜

  it('53 列 × 7 行、日曜始まりで、最終列に end を含む', () => {
    const hm = buildHeatmap(end, new Map())
    expect(hm.weeks).toHaveLength(53)
    expect(hm.weeks.every((w) => w.length === 7)).toBe(true)
    expect(hm.weeks.every((w) => dayOfWeek(w[0].date) === 0)).toBe(true)
    expect(hm.weeks[52][4].date).toBe(end)
  })

  it('過去 365 日だけが範囲内で、未来のセルは範囲外', () => {
    const hm = buildHeatmap(end, new Map())
    const inRange = hm.weeks.flat().filter((c) => c.inRange)
    expect(inRange).toHaveLength(365)
    expect(inRange[0].date).toBe('2025-10-16')
    expect(hm.weeks[52][5]).toMatchObject({ date: '2026-10-16', inRange: false })
  })

  it('範囲外のセルには学習時間を入れない', () => {
    const hm = buildHeatmap(
      end,
      new Map([
        ['2025-10-12', 200],
        ['2026-10-15', 45],
      ])
    )
    const cells = hm.weeks.flat()
    expect(cells.find((c) => c.date === '2025-10-12')?.minutes).toBe(0)
    expect(cells.find((c) => c.date === end)).toMatchObject({ minutes: 45, level: 2 })
  })

  it('月ラベルは月の最初の日曜の列に置く', () => {
    const hm = buildHeatmap(end, new Map())
    const oct = hm.months.find((m) => m.label === '10月')
    expect(oct && hm.weeks[oct.col][0].date).toBe('2026-10-04')
    expect(hm.months.map((m) => m.label)).toContain('3月')
  })

  it('スマホ用に 26 列でも作れる', () => {
    const hm = buildHeatmap(end, new Map(), 26)
    expect(hm.weeks).toHaveLength(26)
    expect(hm.weeks[25][4].date).toBe(end)
  })
})
