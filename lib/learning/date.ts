// 学習ログの日付はすべて JST（UTC+9、サマータイムなし）の 'YYYY-MM-DD' 文字列で扱う
// 計算は UTC の 0 時として行うことで、実行環境のタイムゾーンに依存しないようにする

export type IsoDate = string

const DAY_MS = 86_400_000
const JST_OFFSET_MS = 9 * 60 * 60 * 1000
const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/

export const WEEKDAYS_JA = ['日', '月', '火', '水', '木', '金', '土'] as const

export function isIsoDate(value: string): boolean {
  const m = ISO_DATE_RE.exec(value)
  if (!m) return false
  const t = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return new Date(t).toISOString().slice(0, 10) === value
}

function toUtcMs(date: IsoDate): number {
  const m = ISO_DATE_RE.exec(date)
  if (!m) throw new Error(`Invalid date: ${date}`)
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
}

function fromUtcMs(ms: number): IsoDate {
  return new Date(ms).toISOString().slice(0, 10)
}

/** 与えられた瞬間の JST の日付 */
export function toJstDate(instant: Date): IsoDate {
  return fromUtcMs(instant.getTime() + JST_OFFSET_MS)
}

export function todayJst(): IsoDate {
  return toJstDate(new Date())
}

export function addDays(date: IsoDate, days: number): IsoDate {
  return fromUtcMs(toUtcMs(date) + days * DAY_MS)
}

/** to - from の日数 */
export function diffDays(from: IsoDate, to: IsoDate): number {
  return Math.round((toUtcMs(to) - toUtcMs(from)) / DAY_MS)
}

/** 0 = 日曜 */
export function dayOfWeek(date: IsoDate): number {
  return new Date(toUtcMs(date)).getUTCDay()
}

export function monthOf(date: IsoDate): string {
  return date.slice(0, 7)
}

export function yearOf(date: IsoDate): string {
  return date.slice(0, 4)
}

/** '2026-10-14' → '10/14' */
export function formatMonthDay(date: IsoDate): string {
  const [, m, d] = date.split('-')
  return `${Number(m)}/${Number(d)}`
}

/** '2026-10-14' → '2026年10月14日（火）' */
export function formatDateJa(date: IsoDate): string {
  const [y, m, d] = date.split('-')
  return `${y}年${Number(m)}月${Number(d)}日（${WEEKDAYS_JA[dayOfWeek(date)]}）`
}

/** '2027-01-24' → '2027/01/24' */
export function formatSlash(date: IsoDate): string {
  return date.replaceAll('-', '/')
}
