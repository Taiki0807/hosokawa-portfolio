import { addDays, dayOfWeek, type IsoDate } from './date'

export type HeatLevel = 0 | 1 | 2 | 3 | 4

/** 学習分数/日 → 色の段階。0 / 1〜29 / 30〜59 / 60〜119 / 120 以上 */
export function minutesToLevel(minutes: number): HeatLevel {
  if (!(minutes > 0)) return 0
  if (minutes < 30) return 1
  if (minutes < 60) return 2
  if (minutes < 120) return 3
  return 4
}

export const HEAT_LEVEL_COLORS: Record<HeatLevel, string> = {
  0: '#1f1c36',
  1: '#3b3390',
  2: '#5b4fe0',
  3: '#a79ff2',
  4: '#cbeb4d',
}

export type HeatCell = {
  date: IsoDate
  minutes: number
  level: HeatLevel
  /** 表示期間（end から過去 365 日）に入っているか */
  inRange: boolean
}

export type Heatmap = {
  /** 列（週・日曜始まり）ごとの 7 セル */
  weeks: HeatCell[][]
  /** 月ラベルと、それを置く列番号（0 始まり） */
  months: { col: number; label: string }[]
  start: IsoDate
  end: IsoDate
}

/**
 * end（JST の今日）を最終列に含む、日曜始まりの週 × 7 日のグリッドを作る
 * @param weekCount 列数（デスクトップ 53、スマホ 26）
 * @param days 表示する日数（365）
 */
export function buildHeatmap(
  end: IsoDate,
  minutesByDate: ReadonlyMap<IsoDate, number>,
  weekCount = 53,
  days = 365
): Heatmap {
  const start = addDays(end, -(days - 1))
  const lastSunday = addDays(end, -dayOfWeek(end))
  const firstSunday = addDays(lastSunday, -(weekCount - 1) * 7)

  const weeks: HeatCell[][] = []
  const months: Heatmap['months'] = []

  for (let col = 0; col < weekCount; col++) {
    const sunday = addDays(firstSunday, col * 7)
    const week: HeatCell[] = []
    for (let row = 0; row < 7; row++) {
      const date = addDays(sunday, row)
      const inRange = date >= start && date <= end
      const minutes = inRange ? (minutesByDate.get(date) ?? 0) : 0
      week.push({ date, minutes, level: minutesToLevel(minutes), inRange })
    }
    weeks.push(week)

    // その月の最初の日曜がある列に月ラベルを置く
    const dom = Number(sunday.slice(8, 10))
    if (dom <= 7 && col < weekCount - 1) {
      months.push({ col, label: `${Number(sunday.slice(5, 7))}月` })
    }
  }

  return { weeks, months, start, end }
}
