import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import AiBadge from '@/components/learning/AiBadge'
import NoteMarkdown from '@/components/learning/NoteMarkdown'
import { BoltIcon } from '@/components/ui/icons'
import Tag from '@/components/ui/Tag'
import { getPublishedEntry } from '@/lib/learning/queries'
import { WEEKDAYS_JA, dayOfWeek, formatMonthDay, isIsoDate } from '@/lib/learning/date'
import { getSettings } from '@/lib/settings'

type Props = { params: Promise<{ date: string }> }

// 公開時に updateTag で再検証する。最初のアクセスで作り、以降はキャッシュ
export function generateStaticParams() {
  return []
}

async function load(date: string) {
  if (!isIsoDate(date)) return null
  const settings = await getSettings()
  if (!settings.publish.showLog || !settings.publish.showNotes) return null
  return getPublishedEntry(date)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date } = await params
  const entry = await load(date)
  if (!entry) return {}
  return { title: entry.title || `${date} の学習ログ` }
}

function NeighborLink({
  date,
  label,
  align,
}: {
  date: string | null
  label: string
  align: 'left' | 'right'
}) {
  if (!date) return <div className="hidden flex-1 sm:block" />
  return (
    <Link
      href={`/learning/${date}`}
      className={`bg-surface-0 border-surface-200 hover:border-brand-500 flex flex-1 flex-col gap-1.5 rounded-2xl border px-[22px] py-[18px] transition-colors ${
        align === 'right' ? 'sm:text-right' : ''
      }`}
    >
      <span className="text-ink-600 text-[11px] font-bold">{label}</span>
      <span className="text-ink-950 text-[15px] font-black">{formatMonthDay(date)}</span>
    </Link>
  )
}

export default async function LearningPostPage({ params }: Props) {
  const { date } = await params
  const entry = await load(date)
  if (!entry) notFound()

  const tags = [...new Set(entry.sessions.map((s) => s.tag))]

  return (
    <article className="flex flex-col">
      <header className="flex flex-col gap-5">
        <Link
          href="/#learning"
          className="text-brand-500 inline-flex w-fit items-center gap-1.5 text-[13px] font-bold"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Learning Log
        </Link>
        <div className="text-brand-500 flex items-center gap-2">
          <BoltIcon />
          <span className="text-xs font-bold tracking-[0.12em] uppercase">Daily Log</span>
        </div>
        <h1 className="text-ink-950 text-[30px] leading-[1.35] font-black sm:text-[38px]">
          {entry.title || `${date} の学習ログ`}
        </h1>
        <div className="text-ink-600 flex flex-wrap items-center gap-2.5 text-[13px]">
          <time dateTime={date}>
            {date}（{WEEKDAYS_JA[dayOfWeek(date)]}）
          </time>
          <span className="bg-ink-inverse-400 h-[3px] w-[3px] rounded-full" aria-hidden="true" />
          <span>学習 {entry.minutes}分</span>
          <span className="bg-ink-inverse-400 h-[3px] w-[3px] rounded-full" aria-hidden="true" />
          <span>{entry.sessions.length} sessions</span>
        </div>
        {tags.length > 0 ? (
          <ul className="mt-1 flex flex-wrap gap-2">
            {tags.map((t) => (
              <li
                key={t}
                className="bg-surface-0 border-surface-200 text-ink-950 rounded-full border px-4 py-2 text-[13px] font-bold"
              >
                #{t}
              </li>
            ))}
          </ul>
        ) : null}
      </header>

      <div className="bg-surface-200 my-10 h-px" />

      <div className="flex flex-col gap-11">
        {entry.reportText ? (
          <section className="bg-surface-0 border-brand-500 flex items-start gap-4 rounded-r-2xl border-l-4 px-6 py-5 shadow-[0_20px_40px_-16px_rgba(16,14,24,0.16)]">
            <span
              className="bg-brand-500 inline-flex h-8 w-8 flex-none items-center justify-center rounded-full text-white"
              aria-hidden="true"
            >
              <BoltIcon />
            </span>
            <div className="flex flex-1 flex-col gap-1.5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-brand-500 text-xs font-black tracking-[0.08em] uppercase">
                  今日のまとめ
                </h2>
                {entry.reportAiPolished ? <AiBadge /> : null}
              </div>
              <p className="text-ink-700 text-[15px] leading-[1.9] whitespace-pre-line">
                {entry.reportText}
              </p>
            </div>
          </section>
        ) : null}

        {entry.sessions.map((s, i) => (
          <section key={i} className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-ink-950 text-xl font-black">
                {i + 1}. {s.memo || s.tag}
              </h2>
              <Tag className="flex-none">
                {s.tag} ・ {s.minutes}分
              </Tag>
            </div>
          </section>
        ))}

        {entry.noteMd.trim() ? <NoteMarkdown markdown={entry.noteMd} /> : null}

        <p className="border-surface-200 text-ink-600 border-t pt-[18px] text-xs leading-[1.9]">
          日付・時間・タグ・メモは本人の入力です。
          {entry.reportAiPolished ? '「今日のまとめ」のみAIが文章を整えています。' : null}
        </p>
      </div>

      <nav aria-label="前後の記録" className="mt-16 flex flex-col gap-4 sm:flex-row">
        <NeighborLink date={entry.prevDate} label="← 前の記録" align="left" />
        <NeighborLink date={entry.nextDate} label="次の記録 →" align="right" />
      </nav>
    </article>
  )
}
