import { addDays, diffDays, monthOf, type IsoDate } from './date'
import { minutesToHours, type DayTotal } from './stats'
import type { GoalKind, GoalSource } from '@/lib/db/schema'

export type SessionRecord = { date: IsoDate; tag: string; minutes: number }

export type GoalInput = {
  kind: GoalKind
  period: string
  target: number
  source: GoalSource
  manualValue: number | null
}

export type GoalProgress = { current: number; target: number; percent: number }

/** 'YYYY' / 'YYYY-MM' → 期間の初日と最終日 */
export function periodRange(kind: GoalKind, period: string): { from: IsoDate; to: IsoDate } {
  if (kind === 'yearly') {
    if (!/^\d{4}$/.test(period)) throw new Error(`Invalid yearly period: ${period}`)
    return { from: `${period}-01-01`, to: `${period}-12-31` }
  }
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) throw new Error(`Invalid monthly period: ${period}`)
  const from = `${period}-01`
  const [y, m] = period.split('-').map(Number)
  const next = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`
  return { from, to: addDays(next, -1) }
}

export function goalCurrentValue(goal: GoalInput, days: DayTotal[]): number {
  if (goal.source === 'manual') return goal.manualValue ?? 0
  const { from, to } = periodRange(goal.kind, goal.period)
  const inPeriod = days.filter((d) => d.date >= from && d.date <= to && d.minutes > 0)
  if (goal.source === 'auto:studyDays') return new Set(inPeriod.map((d) => d.date)).size
  return minutesToHours(inPeriod.reduce((sum, d) => sum + d.minutes, 0))
}

export function toProgress(current: number, target: number): GoalProgress {
  const percent = target > 0 ? Math.min(100, Math.max(0, Math.round((current / target) * 100))) : 0
  return { current, target, percent }
}

export function goalProgress(goal: GoalInput, days: DayTotal[]): GoalProgress {
  return toProgress(goalCurrentValue(goal, days), goal.target)
}

/** 試験日までの残り日数（当日 0、過ぎていれば負） */
export function daysUntil(examDate: IsoDate, today: IsoDate): number {
  return diffDays(today, examDate)
}

export type CertTargetInput = {
  progressMode: 'auto' | 'manual'
  manualProgress: number | null
  studyTags: string[]
  targetHours: number | null
}

export type CertProgress = {
  /** 学習計画の進捗（%）。自動で目標時間が未設定なら null */
  percent: number | null
  /** 今月の対象タグの学習時間（分） */
  monthMinutes: number
  /** 対象タグの累計学習時間（分） */
  totalMinutes: number
}

export function certProgress(
  cert: CertTargetInput,
  sessions: SessionRecord[],
  today: IsoDate
): CertProgress {
  const tags = new Set(cert.studyTags)
  const month = monthOf(today)
  let totalMinutes = 0
  let monthMinutes = 0
  for (const s of sessions) {
    if (!tags.has(s.tag) || s.date > today) continue
    totalMinutes += s.minutes
    if (monthOf(s.date) === month) monthMinutes += s.minutes
  }

  let percent: number | null
  if (cert.progressMode === 'manual') {
    percent = cert.manualProgress == null ? null : Math.min(100, Math.max(0, cert.manualProgress))
  } else {
    percent = cert.targetHours ? toProgress(totalMinutes / 60, cert.targetHours).percent : null
  }

  return { percent, monthMinutes, totalMinutes }
}
