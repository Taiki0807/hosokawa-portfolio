'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { generateReviewDrafts, publishReview } from '@/app/admin/review/actions'
import Toggle from '@/components/ui/Toggle'
import { SparkleIcon } from '@/components/ui/icons'
import type { Evidence, ReviewPersona, ReviewTag } from '@/lib/db/schema'
import type { ReviewSource } from '@/lib/ai/generate-review'
import { Notice, btnGhost, btnPrimary, cardClass, inputClass } from './ui'

export type DraftRow = {
  id: number
  tag: ReviewTag
  title: string
  text: string
  evidence: Evidence[]
  published: boolean
}

const PERSONAS: { value: ReviewPersona; label: string }[] = [
  { value: 'boss', label: '上司' },
  { value: 'tech', label: '技術' },
  { value: 'peer', label: '同僚' },
  { value: 'hr', label: '採用担当' },
]
const SOURCES: { value: ReviewSource; label: string }[] = [
  { value: 'log', label: '学習ログ' },
  { value: 'notes', label: '詳細ノート' },
  { value: 'works', label: '成果物' },
]

function Chip({
  on,
  onClick,
  children,
}: {
  on: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`rounded-full border-[1.5px] px-4 py-2 text-[13px] font-bold ${on ? 'bg-surface-950 border-surface-950 text-ink-inverse-50' : 'border-brand-200 text-ink-950 bg-white'}`}
    >
      {children}
    </button>
  )
}

type Props = {
  persona: ReviewPersona
  drafts: DraftRow[]
  aiEnabled: boolean
  lastGeneratedAt: string | null
}

export default function ReviewWorkbench({
  persona,
  drafts: initial,
  aiEnabled,
  lastGeneratedAt,
}: Props) {
  const router = useRouter()
  const [sources, setSources] = useState<ReviewSource[]>(['log', 'notes', 'works'])
  const [drafts, setDrafts] = useState(initial)
  const [generating, startGen] = useTransition()
  const [publishing, startPub] = useTransition()
  const [message, setMessage] = useState<{ tone: 'error' | 'success'; text: string } | null>(null)

  const edit = (id: number, patch: Partial<DraftRow>) =>
    setDrafts((ds) => ds.map((d) => (d.id === id ? { ...d, ...patch } : d)))

  const generate = () =>
    startGen(async () => {
      setMessage(null)
      const res = await generateReviewDrafts({ persona, sources })
      if (!res.ok) return setMessage({ tone: 'error', text: res.error })
      router.refresh()
    })

  const publish = () =>
    startPub(async () => {
      const res = await publishReview({
        persona,
        comments: drafts.map(({ id, tag, title, text, published }) => ({
          id,
          tag,
          title,
          text,
          published,
        })),
      })
      setMessage(
        res.ok
          ? { tone: 'success', text: `${res.data.published}件を公開しました。` }
          : { tone: 'error', text: res.error }
      )
      if (res.ok) router.refresh()
    })

  const preview = drafts.filter((d) => d.published)

  return (
    <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <section className={`${cardClass} flex flex-col gap-5 p-6 sm:p-8`}>
          <div className="flex flex-col gap-2">
            <span className="text-ink-700 text-xs font-bold">誰の目線で書くか</span>
            <div className="flex flex-wrap gap-2">
              {PERSONAS.map((p) => (
                <Link
                  key={p.value}
                  href={`/admin/review?persona=${p.value}`}
                  aria-current={p.value === persona ? 'page' : undefined}
                  className={`rounded-full border-[1.5px] px-4 py-2 text-[13px] font-bold ${p.value === persona ? 'bg-surface-950 border-surface-950 text-ink-inverse-50' : 'border-brand-200 text-ink-950 bg-white'}`}
                >
                  {p.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-ink-700 text-xs font-bold">根拠にするデータ</span>
            <div className="flex flex-wrap gap-2">
              {SOURCES.map((s) => (
                <Chip
                  key={s.value}
                  on={sources.includes(s.value)}
                  onClick={() =>
                    setSources((xs) =>
                      xs.includes(s.value) ? xs.filter((x) => x !== s.value) : [...xs, s.value]
                    )
                  }
                >
                  {s.label}
                </Chip>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              className={btnPrimary}
              disabled={!aiEnabled || generating || sources.length === 0}
              onClick={generate}
            >
              <SparkleIcon size={14} />
              {generating ? '学習ログと成果物を読んでいます…' : 'AIで評価を作る'}
            </button>
            <span className="text-ink-600 text-xs">
              {lastGeneratedAt ? `前回の生成：${lastGeneratedAt}` : 'まだ生成していません'}
            </span>
          </div>
          {!aiEnabled ? (
            <p className="text-ink-600 text-xs">AI はオフになっています（公開とAIの設定）。</p>
          ) : null}
        </section>

        {message ? <Notice tone={message.tone}>{message.text}</Notice> : null}

        {drafts.length > 0 ? (
          <section className="flex flex-col gap-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-ink-950 text-lg font-black">生成されたコメント案</h2>
              <span className="text-ink-600 text-xs font-bold">
                文章は自由に直せます。公開するものだけオンにしてください。
              </span>
            </div>
            {drafts.map((d) => (
              <div key={d.id} className={`${cardClass} flex flex-col gap-3 p-5 sm:p-6`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
                    <select
                      aria-label="区分"
                      value={d.tag}
                      onChange={(e) => edit(d.id, { tag: e.target.value as ReviewTag })}
                      className="bg-brand-100 text-brand-700 rounded-full px-3 py-1 text-[11px] font-black"
                    >
                      <option value="強み">強み</option>
                      <option value="技術">技術</option>
                      <option value="期待">期待</option>
                    </select>
                    <input
                      aria-label="見出し"
                      className={`${inputClass} min-w-0 flex-1 py-2 text-base font-black`}
                      value={d.title}
                      onChange={(e) => edit(d.id, { title: e.target.value })}
                    />
                  </div>
                  <Toggle
                    label={`「${d.title}」を公開する`}
                    checked={d.published}
                    onChange={(v) => edit(d.id, { published: v })}
                  />
                </div>
                <textarea
                  aria-label="本文"
                  rows={3}
                  className={`${inputClass} resize-y text-sm leading-[1.9]`}
                  value={d.text}
                  onChange={(e) => edit(d.id, { text: e.target.value })}
                />
                <div className="text-ink-600 text-xs">
                  根拠：
                  {d.evidence.length
                    ? d.evidence.map((e) => e.label).join(' ／ ')
                    : '（リンクなし）'}
                </div>
              </div>
            ))}
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" className={btnPrimary} disabled={publishing} onClick={publish}>
                {publishing ? '公開しています…' : '選んだコメントを公開'}
              </button>
              <button
                type="button"
                className={btnGhost}
                disabled={generating || !aiEnabled}
                onClick={generate}
              >
                もう一度作る
              </button>
              <Link href="/#review" className="text-brand-500 text-[13px] font-bold">
                ホームで見る →
              </Link>
            </div>
          </section>
        ) : null}

        <div className="bg-surface-950 flex flex-col gap-2 rounded-3xl px-7 py-6">
          <span className="text-xs font-bold tracking-[0.12em] text-lime-500 uppercase">
            AIへのルール
          </span>
          <span className="text-ink-inverse-50 text-[13px] leading-[1.9]">
            ① 根拠になる記録（日付・件数）を必ず引用する　② 記録にないことは書かない　③
            強みだけでなく、伸びしろも1つ含める　④
            公開ページでは「AIが作成」「実在の人物の発言ではない」と明記する
          </span>
        </div>
      </div>

      <aside className="flex w-full flex-col gap-6 xl:w-[380px] xl:flex-none">
        <section className={`${cardClass} flex flex-col gap-3 p-6`}>
          <div className="flex items-center justify-between">
            <h2 className="text-ink-950 text-sm font-black">公開時のプレビュー</h2>
            <span className="bg-surface-950 rounded-full px-2.5 py-1 text-[10px] font-black text-lime-500">
              AIが作成
            </span>
          </div>
          {preview.length === 0 ? (
            <p className="text-ink-600 text-xs">公開するコメントが選ばれていません。</p>
          ) : null}
          {preview.map((d) => (
            <div key={d.id} className="bg-surface-50 flex flex-col gap-1 rounded-2xl px-4 py-3">
              <span className="text-ink-950 text-sm font-black">{d.title}</span>
              <span className="text-ink-700 line-clamp-3 text-xs leading-[1.8]">{d.text}</span>
            </div>
          ))}
          <p className="text-ink-600 text-[11px] leading-[1.7]">
            ホームには「AIが作成」「実在の上司の発言ではありません」「本人が確認して公開」が必ず表示されます。
          </p>
        </section>
      </aside>
    </div>
  )
}
