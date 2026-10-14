import { addDays, type IsoDate } from './date'

export type DayTotal = { date: IsoDate; minutes: number }

export type LearningStats = {
  /** 学習した日数（期間内） */
  studyDays: number
  /** 合計学習時間（分・期間内） */
  totalMinutes: number
  /** 今日（今日が未記録なら昨日）まで続いている連続日数 */
  currentStreak: number
  /** 最長の連続日数 */
  longestStreak: number
}

/** 同じ日付の記録を合算し、学習時間 0 分以下・未来の日付を除く */
export function normalizeDays(days: DayTotal[], today: IsoDate): Map<IsoDate, number> {
  const map = new Map<IsoDate, number>()
  for (const { date, minutes } of days) {
    if (date > today || !(minutes > 0)) continue
    map.set(date, (map.get(date) ?? 0) + minutes)
  }
  return map
}

/**
 * @param days 日ごとの学習時間（日付は JST）
 * @param today JST の今日
 * @param from 学習日数・合計時間を数える期間の開始日（省略時は全期間）。連続日数は期間に関係なく数える
 */
export function computeStats(days: DayTotal[], today: IsoDate, from?: IsoDate): LearningStats {
  const map = normalizeDays(days, today)

  let studyDays = 0
  let totalMinutes = 0
  for (const [date, minutes] of map) {
    if (from && date < from) continue
    studyDays += 1
    totalMinutes += minutes
  }

  // 今日まだ記録していなくても、昨日まで続いていれば連続は途切れていないとみなす
  let currentStreak = 0
  let cursor = map.has(today) ? today : addDays(today, -1)
  while (map.has(cursor)) {
    currentStreak += 1
    cursor = addDays(cursor, -1)
  }

  let longestStreak = 0
  let run = 0
  let prev: IsoDate | undefined
  for (const date of [...map.keys()].sort()) {
    run = prev && addDays(prev, 1) === date ? run + 1 : 1
    longestStreak = Math.max(longestStreak, run)
    prev = date
  }

  return { studyDays, totalMinutes, currentStreak, longestStreak }
}

/** 分 → 時間（小数1桁） */
export function minutesToHours(minutes: number): number {
  return Math.round((minutes / 60) * 10) / 10
}
