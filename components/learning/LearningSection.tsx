import type { ReactNode } from 'react'
import SectionHeader from '@/components/ui/SectionHeader'
import { getPublicLearningData } from '@/lib/learning/queries'
import { addDays, todayJst } from '@/lib/learning/date'
import { computeStats, minutesToHours } from '@/lib/learning/stats'
import { buildHeatmap } from '@/lib/learning/heatmap'
import { tagTotals } from '@/lib/learning/topics'
import { getSettings } from '@/lib/settings'
import LearningExplorer from './LearningExplorer'
import type { ExplorerData } from './types'

const TOPIC_LIMIT = 6
const FILTER_LIMIT = 5

function formatHours(minutes: number) {
  const hours = minutesToHours(minutes)
  return hours >= 100 ? String(Math.round(hours)) : String(hours)
}

export default async function LearningSection({ goals }: { goals: ReactNode }) {
  const [data, settings] = await Promise.all([getPublicLearningData(), getSettings()])
  const { showLog, showHeatmap, showNotes } = settings.publish
  if (!showLog && !showHeatmap) return <>{goals}</>

  const today = todayJst()
  const start = addDays(today, -364)
  const minutesByDate = new Map(data.days.map((d) => [d.date, d.minutes]))
  const heatmap = buildHeatmap(today, minutesByDate)
  const stats = computeStats(data.days, today, start)

  const recentEntries = data.entries.filter((e) => e.date >= start && e.date <= today)
  const tagsByDate = new Map(
    recentEntries.map((e) => [e.date, [...new Set(e.sessions.map((s) => s.tag))]])
  )
  const publishedDates = new Set(recentEntries.map((e) => e.date))
  const privateDays = Object.fromEntries(
    data.days
      .filter((d) => d.date >= start && d.date <= today && !publishedDates.has(d.date))
      .map((d) => [d.date, d.minutes])
  )

  const totals = tagTotals(data.sessions, start, today)
  const max = totals[0]?.minutes ?? 0

  const explorer: ExplorerData = {
    today,
    weeks: heatmap.weeks.map((w) => w.map((c) => ({ ...c, tags: tagsByDate.get(c.date) ?? [] }))),
    months: heatmap.months,
    stats: {
      studyDays: stats.studyDays,
      hours: formatHours(stats.totalMinutes),
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
    },
    entries: showLog ? recentEntries : [],
    privateDays: showLog ? privateDays : {},
    topics: totals.slice(0, TOPIC_LIMIT).map((t) => ({
      tag: t.tag,
      hours: minutesToHours(t.minutes),
      ratio: max ? t.minutes / max : 0,
    })),
    filterTags: totals.slice(0, FILTER_LIMIT).map((t) => t.tag),
    showHeatmap,
    showLog,
    showNotes,
  }

  return (
    <section id="learning" aria-labelledby="learning-title" className="scroll-mt-24">
      <div className="px-6 pt-6 pb-10 sm:px-10 lg:px-20">
        <SectionHeader
          eyebrow="Learning Log"
          title={<span id="learning-title">毎日の学習ログ</span>}
          description="仕事で触れきれない技術も、毎日少しずつ。学んだ日・時間・内容を記録しています。マスにカーソルを重ねると概要、クリックで詳細が読めます。"
        />
      </div>
      <LearningExplorer data={explorer} goals={goals} />
    </section>
  )
}
