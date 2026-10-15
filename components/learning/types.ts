import type { HeatLevel } from '@/lib/learning/heatmap'
import type { PublicEntry } from '@/lib/learning/queries'

export type ExplorerCell = {
  date: string
  minutes: number
  level: HeatLevel
  inRange: boolean
  /** 内容まで公開している日のタグ（非公開の日は空） */
  tags: string[]
}

export type ExplorerData = {
  today: string
  weeks: ExplorerCell[][]
  months: { col: number; label: string }[]
  stats: { studyDays: number; hours: string; currentStreak: number; longestStreak: number }
  entries: PublicEntry[]
  /** 時間だけ公開している日 */
  privateDays: Record<string, number>
  topics: { tag: string; hours: number; ratio: number }[]
  filterTags: string[]
  showHeatmap: boolean
  showLog: boolean
  showNotes: boolean
}
