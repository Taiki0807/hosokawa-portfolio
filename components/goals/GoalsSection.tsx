import Link from 'next/link'
import ProgressBar from '@/components/ui/ProgressBar'
import {
  getGoalsData,
  getPublicLearningData,
  type CertTargetRow,
  type GoalRow,
} from '@/lib/learning/queries'
import { formatSlash, monthOf, todayJst, yearOf } from '@/lib/learning/date'
import { certProgress, daysUntil, goalProgress } from '@/lib/learning/goals'
import { minutesToHours } from '@/lib/learning/stats'
import type { SessionRecord } from '@/lib/learning/goals'

const card =
  'bg-surface-0 border-surface-200 rounded-3xl border px-6 py-6 shadow-[var(--shadow-soft)] sm:px-7'

function formatValue(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

function GoalRowView({ goal, sessions }: { goal: GoalRow; sessions: SessionRecord[] }) {
  const p = goalProgress(goal, sessions)
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-ink-950 text-sm font-bold">{goal.label}</span>
        <span className="text-brand-700 text-[13px] font-black whitespace-nowrap">
          {formatValue(p.current)}
          <span className="text-ink-600 font-medium">
            {' '}
            / {formatValue(p.target)}
            {goal.unit}
          </span>
        </span>
      </div>
      <ProgressBar percent={p.percent} label={`${goal.label}の進捗`} />
      {goal.note ? <div className="text-ink-600 text-xs">{goal.note}</div> : null}
    </div>
  )
}

function ExamDate({ date, className }: { date: string | null; className: string }) {
  return date ? (
    <span className={`text-xs font-bold ${className}`}>受験予定 {formatSlash(date)}</span>
  ) : null
}

function NowStudying({
  cert,
  sessions,
  today,
}: {
  cert: CertTargetRow
  sessions: SessionRecord[]
  today: string
}) {
  const p = certProgress(cert, sessions, today)
  const left = cert.examDate ? daysUntil(cert.examDate, today) : null
  return (
    <div className="from-brand-700 via-brand-500 to-brand-400 relative flex min-w-0 flex-col gap-[22px] overflow-hidden rounded-[28px] bg-linear-120 px-6 py-8 shadow-[0_40px_70px_-36px_rgba(52,44,122,0.7)] sm:px-10 sm:py-9 lg:flex-[1.25]">
      <svg
        className="pointer-events-none absolute top-0 right-0 h-full w-[320px]"
        viewBox="0 0 320 400"
        preserveAspectRatio="xMaxYMid slice"
        aria-hidden="true"
      >
        <g stroke="#ffffff" strokeOpacity="0.09" strokeWidth="26" strokeLinecap="round">
          <line x1="230" y1="440" x2="330" y2="-40" />
          <line x1="290" y1="440" x2="390" y2="-40" />
        </g>
      </svg>
      <div className="relative flex flex-wrap items-center justify-between gap-2">
        <span className="text-ink-950 inline-flex items-center gap-2.5 rounded-full bg-lime-500 py-[7px] pr-4 pl-3 text-xs font-black tracking-[0.1em]">
          <span className="bg-ink-950 inline-block h-2 w-2 rounded-full" aria-hidden="true" />
          NOW STUDYING
        </span>
        <ExamDate date={cert.examDate} className="text-brand-200" />
      </div>
      <div className="relative flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          {cert.issuer ? (
            <span className="text-brand-200 text-xs font-bold tracking-[0.08em]">
              {cert.issuer}
            </span>
          ) : null}
          <h3 className="text-ink-inverse-50 text-[22px] leading-[1.35] font-black sm:text-[26px]">
            {cert.name}
          </h3>
        </div>
        {left != null && left >= 0 ? (
          <div className="flex-none text-right">
            <div className="text-brand-200 text-xs font-bold">試験まで</div>
            <div className="text-[52px] leading-none font-black text-lime-500 sm:text-[64px]">
              {left}
              <span className="ml-1 text-xl">日</span>
            </div>
          </div>
        ) : null}
      </div>
      {p.percent != null ? (
        <div className="relative flex flex-col gap-2.5">
          <div className="text-ink-inverse-50 flex justify-between text-[13px] font-bold">
            <span>学習計画の進捗</span>
            <span className="text-lime-500">{p.percent}%</span>
          </div>
          <ProgressBar
            percent={p.percent}
            label="学習計画の進捗"
            variant="lime-on-dark"
            size="md"
          />
        </div>
      ) : null}
      <div className="relative flex flex-wrap gap-3">
        <span className="bg-surface-950/35 inline-flex flex-col rounded-[14px] px-4 py-2.5">
          <span className="text-brand-200 text-[11px] font-bold">今月の学習</span>
          <span className="text-ink-inverse-50 text-lg font-black">
            {minutesToHours(p.monthMinutes)}
            <span className="ml-0.5 text-xs">時間</span>
          </span>
        </span>
        {cert.currentFocus ? (
          <span className="bg-surface-950/35 inline-flex flex-col rounded-[14px] px-4 py-2.5">
            <span className="text-brand-200 text-[11px] font-bold">取り組み中</span>
            <span className="text-ink-inverse-50 mt-[3px] text-sm font-black">
              {cert.currentFocus}
            </span>
          </span>
        ) : null}
        <Link
          href="/#learning"
          className="ml-auto inline-flex items-center gap-1.5 self-end text-[13px] font-bold text-lime-500"
        >
          学習ログを見る →
        </Link>
      </div>
    </div>
  )
}

function NextCert({
  cert,
  sessions,
  today,
}: {
  cert: CertTargetRow
  sessions: SessionRecord[]
  today: string
}) {
  const p = certProgress(cert, sessions, today)
  const left = cert.examDate ? daysUntil(cert.examDate, today) : null
  return (
    <div className={`${card} flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <span className="bg-brand-100 text-brand-700 inline-flex items-center gap-2 rounded-full px-3 py-[5px] text-[11px] font-black tracking-[0.1em]">
          <span className="bg-brand-500 h-1.5 w-1.5 rounded-full" aria-hidden="true" />
          NEXT
        </span>
        <ExamDate date={cert.examDate} className="text-ink-600" />
      </div>
      <div>
        {cert.issuer ? <div className="text-ink-600 text-xs font-bold">{cert.issuer}</div> : null}
        <div className="text-ink-950 text-lg leading-[1.4] font-black">{cert.name}</div>
      </div>
      <div className="flex items-center gap-3.5">
        {p.percent != null ? (
          <>
            <ProgressBar
              percent={p.percent}
              label={`${cert.name}の学習計画の進捗`}
              className="flex-1"
            />
            <span className="text-brand-700 text-xs font-black">{p.percent}%</span>
          </>
        ) : (
          <span className="flex-1" />
        )}
        {left != null && left >= 0 ? (
          <span className="text-ink-600 text-xs font-bold">あと{left}日</span>
        ) : null}
      </div>
    </div>
  )
}

export default async function GoalsSection() {
  const [{ goals, certTargets }, learning] = await Promise.all([
    getGoalsData(),
    getPublicLearningData(),
  ])
  const today = todayJst()
  const year = yearOf(today)
  const month = monthOf(today)

  const yearly = goals.filter((g) => g.kind === 'yearly' && g.period === year)
  const monthly = goals.filter((g) => g.kind === 'monthly' && g.period === month)
  const upcoming = certTargets.filter((c) => !c.examDate || c.examDate >= today)
  const now = upcoming.find((c) => c.isNowStudying)
  const next = upcoming.find((c) => c !== now)

  if (!now && !next && yearly.length === 0 && monthly.length === 0) return null

  return (
    <div id="goals" className="scroll-mt-24 px-6 pb-14 sm:px-10 lg:px-20">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-ink-950 text-2xl font-black">目標と挑戦中の資格</h3>
        <span className="text-ink-600 text-xs font-bold">進捗は学習ログと連動します</span>
      </div>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
        {now ? <NowStudying cert={now} sessions={learning.sessions} today={today} /> : null}
        {next || yearly.length > 0 ? (
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            {next ? <NextCert cert={next} sessions={learning.sessions} today={today} /> : null}
            {yearly.length > 0 ? (
              <div className={`${card} flex flex-1 flex-col gap-[18px]`}>
                <div className="flex items-baseline justify-between">
                  <span className="text-ink-950 text-base font-black">{year}年の目標</span>
                  <span className="text-ink-600 text-[11px] font-bold">YEARLY</span>
                </div>
                {yearly.map((g) => (
                  <GoalRowView key={g.id} goal={g} sessions={learning.sessions} />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      {monthly.length > 0 ? (
        <div
          className={`${card} mt-6 flex flex-col gap-6 sm:px-8 lg:flex-row lg:items-center lg:gap-10`}
        >
          <div className="w-[140px] flex-none">
            <div className="text-ink-600 text-[11px] font-bold tracking-[0.1em]">MONTHLY</div>
            <div className="text-ink-950 mt-1 text-xl font-black">
              {Number(month.slice(5))}月の目標
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-6 md:flex-row md:gap-10">
            {monthly.map((g) => (
              <div key={g.id} className="flex-1">
                <GoalRowView goal={g} sessions={learning.sessions} />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
