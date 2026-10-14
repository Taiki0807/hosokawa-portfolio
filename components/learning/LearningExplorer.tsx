'use client'

import Link from 'next/link'
import { useMemo, useState, type ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import Tag from '@/components/ui/Tag'
import { WEEKDAYS_JA, dayOfWeek, formatMonthDay } from '@/lib/learning/date'
import Heatmap from './Heatmap'
import DayDetail from './DayDetail'
import type { ExplorerData } from './types'

const RECENT_LIMIT = 8
const ALL = '__all__'

type Props = { data: ExplorerData; goals: ReactNode }

export default function LearningExplorer({ data, goals }: Props) {
  const { data: session } = useSession()
  const [selected, setSelected] = useState(data.entries[0]?.date ?? data.today)
  const [filter, setFilter] = useState(ALL)
  const entryByDate = useMemo(() => new Map(data.entries.map((e) => [e.date, e])), [data.entries])

  const rows = useMemo(
    () =>
      data.entries
        .filter((e) => filter === ALL || e.sessions.some((s) => s.tag === filter))
        .slice(0, RECENT_LIMIT),
    [data.entries, filter]
  )

  const select = (date: string) => setSelected(date)

  return (
    <>
      {data.showHeatmap ? (
        <div className="px-6 pb-14 sm:px-10 lg:px-20">
          <div className="bg-surface-950 relative overflow-hidden rounded-[28px] bg-[radial-gradient(900px_380px_at_88%_-20%,rgba(91,79,224,0.42),transparent_62%)] px-6 pt-8 pb-7 shadow-[0_50px_90px_-40px_rgba(16,14,24,0.6)] sm:px-12 sm:pt-11 sm:pb-9">
            <svg
              className="pointer-events-none absolute top-0 right-0 h-[220px] w-[360px]"
              viewBox="0 0 360 220"
              aria-hidden="true"
            >
              <g strokeLinecap="round" strokeWidth="16" fill="none" opacity="0.35">
                <line x1="250" y1="-20" x2="150" y2="150" stroke="#7a6fe0" />
                <line x1="300" y1="-20" x2="200" y2="150" stroke="#342c7a" />
                <line x1="350" y1="-20" x2="250" y2="150" stroke="#cbeb4d" />
              </g>
            </svg>
            <dl className="relative grid grid-cols-2 gap-x-8 gap-y-6 border-b border-white/10 pb-8 lg:flex lg:gap-[72px]">
              {[
                ['学習した日', data.stats.studyDays, '日'],
                ['合計学習時間', data.stats.hours, '時間'],
                ['現在の連続記録', data.stats.currentStreak, '日'],
                ['最長の連続記録', data.stats.longestStreak, '日'],
              ].map(([label, value, unit]) => (
                <div key={label}>
                  <dt className="text-ink-inverse-400 text-xs font-bold tracking-[0.08em]">
                    {label}
                  </dt>
                  <dd className="text-ink-inverse-50 mt-2 text-[40px] leading-[1.1] font-black sm:text-[52px]">
                    {value}
                    <span className="ml-1.5 text-lg font-bold text-lime-500">{unit}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <div className="relative mt-4">
              <Heatmap
                weeks={data.weeks}
                months={data.months}
                selected={selected}
                onSelect={select}
              />
            </div>
            <div className="relative mt-6 flex flex-wrap items-center justify-between gap-3">
              <span className="text-ink-inverse-400 text-xs">
                1マス = 1日 ・ 色は学習時間の長さ
              </span>
              <div className="text-ink-inverse-400 flex items-center gap-[7px] text-xs font-bold">
                0分
                {['bg-heat-0', 'bg-heat-1', 'bg-heat-2', 'bg-heat-3', 'bg-heat-4'].map((c) => (
                  <span key={c} aria-hidden="true" className={`h-[15px] w-[15px] rounded ${c}`} />
                ))}
                120分以上
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {goals}

      {data.showLog ? (
        <div className="flex flex-col gap-10 px-6 pb-28 sm:px-10 lg:flex-row lg:items-start lg:px-20">
          <div className="flex min-w-0 flex-1 flex-col gap-5">
            <div className="flex items-baseline justify-between">
              <h3 className="text-ink-950 text-2xl font-black">最近の記録</h3>
              <span className="text-ink-600 text-xs font-bold">タグで絞り込み</span>
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="タグで絞り込み">
              {[ALL, ...data.filterTags].map((tag) => {
                const active = tag === filter
                return (
                  <button
                    key={tag}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFilter(tag)}
                    className={`focus-visible:outline-brand-500 rounded-full px-4 py-2 text-[13px] font-bold shadow-[0_10px_20px_-12px_rgba(16,14,24,0.25)] focus-visible:outline-2 ${
                      active ? 'bg-surface-950 text-ink-inverse-50' : 'bg-surface-0 text-ink-950'
                    }`}
                  >
                    {tag === ALL ? 'すべて' : tag}
                  </button>
                )
              })}
            </div>
            <ul className="flex flex-col gap-2.5">
              {rows.length === 0 ? (
                <li className="bg-surface-0 text-ink-600 rounded-2xl px-6 py-7 text-center text-sm">
                  まだ記録がありません。
                </li>
              ) : null}
              {rows.map((e) => {
                const active = e.date === selected
                return (
                  <li key={e.date}>
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => select(e.date)}
                      className={`log-row focus-visible:outline-brand-500 flex w-full items-center gap-4 rounded-2xl border-[1.5px] px-5 py-[18px] text-left shadow-[0_16px_32px_-20px_rgba(16,14,24,0.22)] transition-transform hover:translate-x-[3px] focus-visible:outline-2 sm:gap-6 sm:px-6 ${
                        active
                          ? 'bg-surface-0 border-brand-500'
                          : 'bg-surface-0/70 border-transparent'
                      }`}
                    >
                      <div className="w-16 flex-none sm:w-24">
                        <div className="text-ink-950 text-lg font-black">
                          {formatMonthDay(e.date)}
                        </div>
                        <div className="text-ink-600 mt-0.5 text-xs font-bold">
                          {WEEKDAYS_JA[dayOfWeek(e.date)]}曜
                        </div>
                      </div>
                      <div className="text-brand-700 w-14 flex-none text-[15px] font-black sm:w-16">
                        {e.minutes}
                        <span className="ml-0.5 text-[11px] font-bold">分</span>
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <div className="flex flex-wrap gap-1.5">
                          {[...new Set(e.sessions.map((s) => s.tag))].map((t) => (
                            <Tag key={t}>{t}</Tag>
                          ))}
                        </div>
                        <div className="text-ink-700 line-clamp-2 text-sm leading-[1.7]">
                          {e.title ||
                            e.sessions
                              .map((s) => s.memo)
                              .filter(Boolean)
                              .join('。')}
                        </div>
                      </div>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#5b5872"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="flex-none"
                        aria-hidden="true"
                      >
                        <path d="M9 6l6 6-6 6" />
                      </svg>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="flex w-full flex-none flex-col gap-6 lg:sticky lg:top-[100px] lg:w-[500px]">
            <DayDetail
              date={selected}
              entry={entryByDate.get(selected)}
              privateMinutes={data.privateDays[selected]}
              showNotes={data.showNotes}
            />
            {data.topics.length > 0 ? (
              <section className="bg-surface-0 border-surface-200 flex flex-col gap-4 rounded-3xl border px-6 py-7 shadow-[var(--shadow-soft)] sm:px-8">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-ink-950 text-base font-black">学習トピック</h3>
                  <span className="text-ink-600 text-[11px] font-bold">過去1年・時間</span>
                </div>
                <ul className="flex flex-col gap-4">
                  {data.topics.map((t) => (
                    <li key={t.tag} className="flex items-center gap-3">
                      <span className="text-ink-950 w-[88px] flex-none truncate text-xs font-bold">
                        {t.tag}
                      </span>
                      <span
                        className="bg-surface-200 h-2.5 flex-1 overflow-hidden rounded-full"
                        aria-hidden="true"
                      >
                        <span
                          className="from-brand-400 to-brand-500 block h-full rounded-full bg-linear-to-r"
                          style={{ width: `${Math.max(2, t.ratio * 100)}%` }}
                        />
                      </span>
                      <span className="text-brand-700 w-[52px] flex-none text-right text-xs font-black">
                        {t.hours}h
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {session?.user?.login ? (
              <Link
                href="/admin/learning/new"
                className="border-ink-600 text-ink-950 flex items-center justify-between gap-3 rounded-2xl border-[1.5px] border-dashed px-[22px] py-4 text-[13px] font-bold"
              >
                <span>
                  今日の学習を記録する{' '}
                  <span className="text-ink-600 font-medium">（管理者用）</span>
                </span>
                <span aria-hidden="true">→</span>
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  )
}
