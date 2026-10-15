import Link from 'next/link'
import SectionHeader from '@/components/ui/SectionHeader'
import {
  getPublishedReview,
  PERSONA_LABELS,
  safeEvidenceHref,
  type ReviewCommentRow,
} from '@/lib/review/queries'
import { getPublicLearningData } from '@/lib/learning/queries'
import { addDays, formatSlash, toJstDate, todayJst } from '@/lib/learning/date'
import { domainBreakdown, tagTotals } from '@/lib/learning/topics'
import { minutesToHours } from '@/lib/learning/stats'
import { REVIEW_PERSONAS } from '@/lib/db/schema'
import ReviewTabs from './ReviewTabs'

function PersonaAvatar({ persona }: { persona: string }) {
  const id = `review-avatar-${persona}`
  return (
    <div className="relative h-20 w-20 flex-none lg:h-32 lg:w-32">
      <svg viewBox="0 0 128 128" className="h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7a6fe0" />
            <stop offset="1" stopColor="#342c7a" />
          </linearGradient>
        </defs>
        <circle cx="64" cy="64" r="64" fill={`url(#${id})`} />
        <circle cx="64" cy="50" r="22" fill="#f5f4fb" />
        <path d="M20 112c4-26 22-38 44-38s40 12 44 38a64 64 0 01-88 0z" fill="#f5f4fb" />
        <path d="M52 76l12 14 12-14" fill="#cbeb4d" />
        <path d="M60 80l4 22 4-22z" fill="#100e18" />
      </svg>
      <span className="text-ink-950 border-brand-150 absolute right-[-4px] bottom-1 rounded-full border-[3px] bg-lime-500 px-[9px] py-[3px] text-[11px] font-black">
        AI
      </span>
    </div>
  )
}

function Evidence({ items }: { items: ReviewCommentRow['evidence'] }) {
  const links = items.flatMap((e) => {
    const href = safeEvidenceHref(e.href)
    return href ? [{ ...e, href }] : []
  })
  if (links.length === 0) return null
  return (
    <ul className="mt-1 flex flex-wrap gap-2" aria-label="根拠">
      {links.map((e, i) => (
        <li key={i}>
          <Link
            href={e.href}
            className="bg-brand-100 text-brand-700 inline-flex items-center gap-1.5 rounded-full px-3 py-[5px] text-[11px] font-bold hover:underline"
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
            {e.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}

function Bubble({ comment }: { comment: ReviewCommentRow }) {
  const dark = comment.tag === '期待'
  return (
    <article
      className={`relative flex flex-col gap-3 rounded-3xl border px-6 py-6 shadow-[var(--shadow-bubble)] sm:px-[30px] sm:py-[26px] ${
        dark ? 'bg-surface-950 border-surface-950' : 'bg-surface-0 border-surface-200'
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute top-8 -left-[9px] hidden h-[18px] w-[18px] rotate-45 border-b border-l lg:block ${
          dark ? 'bg-surface-950 border-surface-950' : 'bg-surface-0 border-surface-200'
        }`}
      />
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-black tracking-[0.08em] ${
            dark ? 'text-ink-950 bg-lime-500' : 'bg-brand-100 text-brand-700'
          }`}
        >
          {comment.tag}
        </span>
        <h3 className={`text-lg font-black ${dark ? 'text-ink-inverse-50' : 'text-ink-950'}`}>
          {comment.title}
        </h3>
      </div>
      <p
        className={`text-[15px] leading-[1.95] whitespace-pre-line ${dark ? 'text-ink-inverse-50' : 'text-ink-700'}`}
      >
        {comment.text}
      </p>
      <Evidence items={comment.evidence} />
    </article>
  )
}

async function DomainBreakdown() {
  const { sessions } = await getPublicLearningData()
  const today = todayJst()
  const totals = tagTotals(sessions, addDays(today, -364), today)
  const domains = domainBreakdown(totals)
  const all = totals.reduce((s, t) => s + t.minutes, 0)
  if (all === 0) return null
  return (
    <div className="bg-surface-0 border-surface-200 flex flex-col gap-3.5 rounded-3xl border px-6 py-6 shadow-[0_28px_54px_-30px_rgba(16,14,24,0.25)] sm:px-[30px]">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-ink-950 text-base font-black">記録時間から見た技術領域</h3>
        <span className="text-ink-600 text-xs font-bold">
          過去1年・合計{Math.round(minutesToHours(all))}時間
        </span>
      </div>
      <div
        className="bg-surface-200 flex h-3.5 gap-0.5 overflow-hidden rounded-full"
        aria-hidden="true"
      >
        {domains.map((d) =>
          d.minutes > 0 ? (
            <div
              key={d.domain.id}
              style={{ width: `${d.ratio * 100}%`, background: d.domain.color }}
            />
          ) : null
        )}
      </div>
      <ul className="flex flex-wrap gap-x-[22px] gap-y-2">
        {domains.map((d) => (
          <li
            key={d.domain.id}
            className="text-ink-700 inline-flex items-center gap-2 text-xs font-bold"
          >
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-[3px] border border-black/15"
              style={{ background: d.domain.color }}
            />
            {d.domain.label}{' '}
            <span className="text-brand-700">
              {Math.round(minutesToHours(d.minutes))}h（{Math.round(d.ratio * 100)}%）
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default async function ReviewSection() {
  const { comments, updatedAt } = await getPublishedReview()
  if (comments.length === 0) return null

  const breakdown = await DomainBreakdown()
  const panels = REVIEW_PERSONAS.flatMap((persona) => {
    const items = comments.filter((c) => c.persona === persona)
    if (items.length === 0) return []
    const label = PERSONA_LABELS[persona]
    return [
      {
        id: persona,
        tab: label.tab,
        aside: (
          <>
            <PersonaAvatar persona={persona} />
            <div className="lg:text-center">
              <div className="text-ink-950 text-[15px] font-black">{label.title}</div>
              <div className="text-ink-600 mt-1 text-xs leading-[1.7] whitespace-pre-line">
                {label.description}
              </div>
            </div>
          </>
        ),
        content: (
          <>
            {persona === 'tech' ? breakdown : null}
            {items.map((c) => (
              <Bubble key={c.id} comment={c} />
            ))}
            <p className="text-ink-600 text-xs leading-[1.9]">
              根拠にしたデータ：学習・開発ログ／詳細ノート／成果物（Projects・Blog）。AIが記録にないことを書き足さないよう、根拠の記録とあわせて本人が確認しています。
            </p>
          </>
        ),
      },
    ]
  })

  return (
    <section
      id="review"
      aria-labelledby="review-title"
      className="scroll-mt-24 px-6 pb-28 sm:px-10 lg:px-20"
    >
      <div className="bg-brand-150 relative overflow-hidden rounded-[32px] px-6 py-10 sm:px-14 sm:pt-14 sm:pb-[60px]">
        <svg
          className="pointer-events-none absolute top-0 right-0 h-full w-[360px]"
          viewBox="0 0 360 600"
          preserveAspectRatio="xMaxYMid slice"
          aria-hidden="true"
        >
          <g strokeLinecap="round" strokeWidth="30" fill="none">
            <line x1="250" y1="660" x2="360" y2="-40" stroke="#7a6fe0" strokeOpacity="0.22" />
            <line x1="320" y1="660" x2="430" y2="-40" stroke="#cbeb4d" strokeOpacity="0.7" />
          </g>
        </svg>
        <div className="relative flex max-w-[760px] flex-col gap-3.5">
          <SectionHeader
            eyebrow="Review"
            title={<span id="review-title">第三者の目線で見た、わたしの強み</span>}
            titleClassName="text-[30px] leading-[1.25] sm:text-[40px]"
            description="自分では言葉にしづらい強みを、学習・開発ログと成果物をもとに、AIに第三者の目線でまとめてもらいました。各コメントには、根拠になった記録へのリンクが付いています。"
          />
          {/* 注意書きは必ず表示する（設定や props で消せない） */}
          <ul className="mt-1 flex flex-wrap gap-2" aria-label="このレビューについて">
            <li className="bg-surface-950 rounded-full px-3 py-[5px] text-[11px] font-black tracking-[0.06em] text-lime-500">
              AIが作成
            </li>
            <li className="bg-surface-0 border-brand-200 text-ink-700 rounded-full border px-3 py-[5px] text-[11px] font-bold">
              実在の上司の発言ではありません
            </li>
            <li className="bg-surface-0 border-brand-200 text-ink-700 rounded-full border px-3 py-[5px] text-[11px] font-bold">
              本人が確認して公開
              {updatedAt ? ` ・ ${formatSlash(toJstDate(new Date(updatedAt)))} 更新` : ''}
            </li>
          </ul>
        </div>
        <ReviewTabs panels={panels} />
      </div>
    </section>
  )
}
