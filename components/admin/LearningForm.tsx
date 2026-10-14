'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useId, useMemo, useState, useTransition } from 'react'
import AiBadge from '@/components/learning/AiBadge'
import NoteMarkdown from '@/components/learning/NoteMarkdown'
import Segmented from '@/components/ui/Segmented'
import Tag from '@/components/ui/Tag'
import { SparkleIcon } from '@/components/ui/icons'
import { HEAT_LEVEL_COLORS, minutesToLevel } from '@/lib/learning/heatmap'
import { formatDateJa, isIsoDate } from '@/lib/learning/date'
import type { EntryStatus } from '@/lib/db/schema'
import { polishEntryReport, saveEntry } from '@/app/admin/learning/actions'
import { FieldError, Notice, btnPrimary, btnSecondary, inputClass, labelClass } from './ui'

const PRESETS = [15, 30, 60, 90, 120]

type SessionDraft = { tag: string; minutes: string; memo: string }

export type LearningFormValues = {
  id?: number
  date: string
  title: string
  status: EntryStatus
  sessions: SessionDraft[]
  noteMd: string
  reportText: string
  reportAiPolished: boolean
}

type Props = {
  initial: LearningFormValues
  tagSuggestions: string[]
  aiEnabled: boolean
  publishOnSave: boolean
  showNotes: boolean
}

const emptySession = (): SessionDraft => ({ tag: '', minutes: '', memo: '' })

export default function LearningForm({
  initial,
  tagSuggestions,
  aiEnabled,
  publishOnSave,
  showNotes,
}: Props) {
  const router = useRouter()
  const formId = useId()
  const [values, setValues] = useState(initial)
  const [visibility, setVisibility] = useState<'published' | 'private'>(
    initial.status === 'private' ? 'private' : 'published'
  )
  const [aiConfirmed, setAiConfirmed] = useState(initial.status !== 'draft')
  const [notePreview, setNotePreview] = useState(false)
  const [polishing, startPolish] = useTransition()
  const [saving, startSave] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState<{ status: EntryStatus; blockedByReview: boolean } | null>(null)

  const totalMinutes = values.sessions.reduce((s, x) => s + (Number(x.minutes) || 0), 0)
  const level = minutesToLevel(totalMinutes)
  const tags = useMemo(
    () => [...new Set(values.sessions.map((s) => s.tag.trim()).filter(Boolean))],
    [values.sessions]
  )

  const set = <K extends keyof LearningFormValues>(key: K, value: LearningFormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }))
    setSaved(null)
  }
  const setSession = (i: number, patch: Partial<SessionDraft>) =>
    set(
      'sessions',
      values.sessions.map((s, j) => (j === i ? { ...s, ...patch } : s))
    )

  const payloadSessions = () =>
    values.sessions.map((s) => ({ tag: s.tag, minutes: Number(s.minutes), memo: s.memo }))

  const polish = () => {
    setError(null)
    startPolish(async () => {
      const res = await polishEntryReport({
        date: values.date,
        sessions: payloadSessions(),
        noteMd: values.noteMd,
      })
      if (!res.ok) {
        setError(res.error)
        setFieldErrors(res.fieldErrors ?? {})
        return
      }
      setValues((v) => ({ ...v, reportText: res.data.text, reportAiPolished: true }))
      // AI が書いた文章は、本人が読んで確認するまで公開できない
      setAiConfirmed(false)
      setSaved(null)
    })
  }

  const save = (intent: 'draft' | 'publish') => {
    setError(null)
    setFieldErrors({})
    startSave(async () => {
      const res = await saveEntry({
        id: values.id,
        date: values.date,
        title: values.title,
        sessions: payloadSessions(),
        noteMd: values.noteMd,
        reportText: values.reportText,
        reportAiPolished: values.reportAiPolished,
        visibility,
        intent,
        aiConfirmed,
      })
      if (!res.ok) {
        setError(res.error)
        setFieldErrors(res.fieldErrors ?? {})
        return
      }
      setSaved({ status: res.data.status, blockedByReview: res.data.blockedByReview })
      setValues((v) => ({ ...v, id: res.data.id, status: res.data.status }))
      if (!values.id) router.replace(`/admin/learning/${res.data.id}`)
      router.refresh()
    })
  }

  const needsConfirm = values.reportAiPolished && values.reportText.trim().length > 0
  const canPublish = !needsConfirm || aiConfirmed
  const err = (key: string) => fieldErrors[key]

  return (
    <div className="flex flex-col gap-10 xl:flex-row xl:items-start">
      {/* 1. 事実を入力する */}
      <form
        id={formId}
        onSubmit={(e) => {
          e.preventDefault()
          save('draft')
        }}
        className="bg-surface-0 border-surface-200 flex w-full flex-col gap-7 rounded-[28px] border p-6 shadow-[var(--shadow-float)] sm:p-10 xl:w-[600px] xl:flex-none"
      >
        <StepTitle n={1}>事実を入力する</StepTitle>

        <div>
          <label htmlFor="lf-title" className={labelClass}>
            タイトル <span className="text-ink-600 font-medium">（任意）</span>
          </label>
          <input
            id="lf-title"
            className={inputClass}
            value={values.title}
            maxLength={120}
            onChange={(e) => set('title', e.target.value)}
          />
          <FieldError message={err('title')} />
        </div>

        <div>
          <label htmlFor="lf-date" className={labelClass}>
            日付
          </label>
          <input
            id="lf-date"
            type="date"
            className={`${inputClass} sm:max-w-[240px]`}
            value={values.date}
            aria-invalid={Boolean(err('date'))}
            onChange={(e) => set('date', e.target.value)}
            required
          />
          <FieldError message={err('date')} />
        </div>

        <fieldset className="flex flex-col gap-4">
          <legend className={labelClass}>
            学習した内容{' '}
            <span className="text-ink-600 font-medium">
              （タグごとに1行。合計 {totalMinutes}分）
            </span>
          </legend>
          {values.sessions.map((s, i) => (
            <div
              key={i}
              className="border-brand-200 flex flex-col gap-3 rounded-2xl border-[1.5px] border-dashed p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex-1">
                  <label
                    htmlFor={`lf-tag-${i}`}
                    className="text-ink-700 mb-1.5 block text-[11px] font-bold"
                  >
                    タグ
                  </label>
                  <input
                    id={`lf-tag-${i}`}
                    className={inputClass}
                    value={s.tag}
                    list={`${formId}-tags`}
                    maxLength={40}
                    aria-invalid={Boolean(err(`sessions.${i}.tag`))}
                    onChange={(e) => setSession(i, { tag: e.target.value })}
                    required
                  />
                  <FieldError message={err(`sessions.${i}.tag`)} />
                </div>
                <div className="sm:w-[140px]">
                  <label
                    htmlFor={`lf-min-${i}`}
                    className="text-ink-700 mb-1.5 block text-[11px] font-bold"
                  >
                    学習時間（分）
                  </label>
                  <input
                    id={`lf-min-${i}`}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={1440}
                    className={inputClass}
                    value={s.minutes}
                    aria-invalid={Boolean(err(`sessions.${i}.minutes`))}
                    onChange={(e) => setSession(i, { minutes: e.target.value })}
                    required
                  />
                  <FieldError message={err(`sessions.${i}.minutes`)} />
                </div>
              </div>
              <div className="flex flex-wrap gap-2" role="group" aria-label="学習時間のプリセット">
                {PRESETS.map((p) => {
                  const on = s.minutes === String(p)
                  return (
                    <button
                      key={p}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setSession(i, { minutes: String(p) })}
                      className={`border-brand-200 rounded-full border-[1.5px] px-3.5 py-[7px] text-xs font-bold ${
                        on ? 'bg-surface-950 text-ink-inverse-50' : 'text-ink-950 bg-white'
                      }`}
                    >
                      {p}分
                    </button>
                  )
                })}
              </div>
              <div className="flex flex-wrap gap-2" role="group" aria-label="タグの候補">
                {tagSuggestions.slice(0, 12).map((t) => {
                  const on = s.tag === t
                  return (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setSession(i, { tag: t })}
                      className={`rounded-full border-[1.5px] px-[15px] py-2 text-[13px] font-bold ${
                        on
                          ? 'bg-brand-500 border-brand-500 text-white'
                          : 'border-brand-200 text-ink-950 bg-white'
                      }`}
                    >
                      {t}
                    </button>
                  )
                })}
              </div>
              <div>
                <label
                  htmlFor={`lf-memo-${i}`}
                  className="text-ink-700 mb-1.5 block text-[11px] font-bold"
                >
                  一言メモ <span className="text-ink-600 font-medium">（走り書きでOK）</span>
                </label>
                <textarea
                  id={`lf-memo-${i}`}
                  rows={2}
                  maxLength={500}
                  className={`${inputClass} resize-y leading-[1.8]`}
                  value={s.memo}
                  onChange={(e) => setSession(i, { memo: e.target.value })}
                />
              </div>
              {values.sessions.length > 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    set(
                      'sessions',
                      values.sessions.filter((_, j) => j !== i)
                    )
                  }
                  className="text-danger-600 w-fit text-xs font-bold"
                >
                  この行を削除
                </button>
              ) : null}
            </div>
          ))}
          <datalist id={`${formId}-tags`}>
            {tagSuggestions.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
          {values.sessions.length < 10 ? (
            <button
              type="button"
              onClick={() => set('sessions', [...values.sessions, emptySession()])}
              className="text-brand-500 w-fit text-[13px] font-bold"
            >
              ＋ 別のタグの学習を追加
            </button>
          ) : null}
          <FieldError message={err('sessions')} />
        </fieldset>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label htmlFor="lf-note" className={`${labelClass} mb-0`}>
              詳細ノート <span className="text-ink-600 font-medium">（任意・Markdown）</span>
            </label>
            <button
              type="button"
              onClick={() => setNotePreview((v) => !v)}
              className="text-brand-500 text-xs font-bold"
            >
              {notePreview ? '編集に戻る' : 'プレビュー'}
            </button>
          </div>
          {notePreview ? (
            <div className="border-brand-200 min-h-[200px] rounded-xl border-[1.5px] bg-white px-5 py-2">
              {values.noteMd.trim() ? (
                <NoteMarkdown markdown={values.noteMd} />
              ) : (
                <p className="text-ink-600 py-6 text-sm">まだ何も書かれていません。</p>
              )}
            </div>
          ) : (
            <textarea
              id="lf-note"
              rows={8}
              className="bg-surface-950 border-brand-700 text-ink-inverse-50 focus:outline-brand-500 w-full resize-y rounded-xl border-[1.5px] px-4 py-3.5 font-mono text-[13px] leading-[1.8] focus:outline-2"
              value={values.noteMd}
              onChange={(e) => set('noteMd', e.target.value)}
              placeholder={
                '## やったこと\n- \n\n## 学んだこと\n\n> [!TIP]\n> Callout はこのように書けます'
              }
            />
          )}
          {!showNotes ? (
            <p className="text-ink-600 mt-1.5 text-xs">
              詳細ノートは非公開の設定です（公開とAIの設定）。
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            className={btnPrimary}
            onClick={polish}
            disabled={!aiEnabled || polishing || saving}
          >
            <SparkleIcon size={14} />
            {polishing ? '整えています…' : 'AIで整える'}
          </button>
          <button type="submit" className={btnSecondary} disabled={saving || polishing}>
            {publishOnSave && canPublish ? '保存して公開' : '下書き保存'}
          </button>
        </div>
        {!aiEnabled ? (
          <p className="text-ink-600 text-xs">AI整形はオフになっています（公開とAIの設定）。</p>
        ) : null}
        <p className="border-surface-200 text-ink-600 border-t pt-[18px] text-xs leading-[1.8]">
          AIに渡すのは、ここで入力した日付・時間・タグ・メモと詳細ノートだけです。
        </p>
      </form>

      {/* 2. 確認して公開する */}
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <StepTitle n={2}>確認して公開する</StepTitle>

        {error ? <Notice tone="error">{error}</Notice> : null}
        {saved ? (
          <Notice tone={saved.blockedByReview ? 'error' : 'success'}>
            {saved.blockedByReview
              ? 'AIが整えた文章を確認していないため、下書きとして保存しました。'
              : saved.status === 'draft'
                ? '下書きとして保存しました。'
                : saved.status === 'private'
                  ? '保存しました（時間だけ公開）。'
                  : '公開しました。'}
            {saved.status === 'published' && showNotes ? (
              <>
                {' '}
                <Link href={`/learning/${values.date}`} className="underline">
                  記事を見る
                </Link>
              </>
            ) : null}
          </Notice>
        ) : null}

        {polishing ? (
          <div
            className="bg-surface-950 flex flex-col items-center gap-3.5 rounded-[28px] px-10 py-16 text-center"
            aria-live="polite"
          >
            <span className="inline-flex h-14 w-14 animate-pulse items-center justify-center rounded-full bg-lime-500/12 text-lime-500 motion-reduce:animate-none">
              <SparkleIcon size={20} />
            </span>
            <div className="text-ink-inverse-50 text-base font-black">文章を整えています…</div>
          </div>
        ) : (
          <div className="bg-surface-0 border-surface-200 flex flex-col gap-5 rounded-[28px] border p-6 shadow-[var(--shadow-float)] sm:p-8">
            <div className="flex flex-wrap items-center gap-4">
              <div
                aria-hidden="true"
                className="h-[17px] w-[17px] flex-none rounded-[5px]"
                style={{
                  background: HEAT_LEVEL_COLORS[level],
                  boxShadow: `0 0 0 4px ${level === 4 ? 'rgba(203,235,77,0.35)' : 'rgba(91,79,224,0.2)'}`,
                }}
              />
              <div className="min-w-0 flex-1">
                <div className="text-ink-600 text-xs font-bold">草に反映されるマスの色</div>
                {values.title ? (
                  <div className="text-brand-700 mt-0.5 text-[15px] font-black">{values.title}</div>
                ) : null}
                <div className="text-ink-950 mt-0.5 text-lg font-black">
                  {isIsoDate(values.date) ? formatDateJa(values.date) : values.date}　{totalMinutes}
                  分
                </div>
              </div>
              <div className="flex max-w-[220px] flex-wrap justify-end gap-1.5">
                {tags.map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </div>
            </div>

            <div className="bg-surface-50 flex flex-col gap-2.5 rounded-2xl px-[22px] py-5">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="lf-report" className="text-ink-950 text-xs font-black">
                  学習レポート（編集できます）
                </label>
                {values.reportAiPolished && values.reportText ? <AiBadge /> : null}
              </div>
              <textarea
                id="lf-report"
                rows={6}
                maxLength={4000}
                className={`${inputClass} text-ink-700 resize-y text-sm leading-[1.95]`}
                value={values.reportText}
                placeholder="「AIで整える」を押すと日報の下書きができます。自分で書いても構いません。"
                onChange={(e) => {
                  set('reportText', e.target.value)
                  if (values.reportAiPolished) setAiConfirmed(false)
                }}
              />
              {needsConfirm ? (
                <label className="text-ink-700 flex items-start gap-2.5 text-[13px] leading-[1.7] font-bold">
                  <input
                    type="checkbox"
                    className="accent-brand-500 mt-1 h-4 w-4 flex-none"
                    checked={aiConfirmed}
                    onChange={(e) => setAiConfirmed(e.target.checked)}
                  />
                  AIが整えた文章を読み、入力した事実と合っていることを確認しました
                </label>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-ink-700 text-xs font-bold">公開範囲</span>
              <Segmented
                label="公開範囲"
                value={visibility}
                onChange={setVisibility}
                options={[
                  { value: 'published', label: '内容まで公開' },
                  { value: 'private', label: '時間だけ公開' },
                ]}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className={btnPrimary}
                onClick={() => save('publish')}
                disabled={!canPublish || saving || polishing}
              >
                {saving ? '保存しています…' : values.status === 'draft' ? '公開する' : '更新する'}
              </button>
              {aiEnabled ? (
                <button
                  type="button"
                  className={btnSecondary}
                  onClick={polish}
                  disabled={polishing || saving}
                >
                  {values.reportAiPolished ? 'もう一度整える' : 'AIで整える'}
                </button>
              ) : null}
            </div>
            {!canPublish ? (
              <p className="text-ink-600 text-xs">
                公開する前に、AIが整えた文章を確認してチェックを入れてください。
              </p>
            ) : null}
          </div>
        )}

        <div className="bg-surface-950 flex flex-col gap-3.5 rounded-3xl px-8 py-7">
          <div className="flex items-center gap-2 text-lime-500">
            <SparkleIcon size={14} />
            <span className="text-xs font-bold tracking-[0.12em] uppercase">AIの使い方ルール</span>
          </div>
          <ol className="text-ink-inverse-50 flex flex-col gap-2.5 text-sm leading-[1.8]">
            {[
              '時間とタグは入力した値のまま。AIは変更しない。',
              '入力にない学習内容や感想は、AIに足させない。',
              '公開前に必ず自分で読み、直してから公開する。',
              '公開ページには「AI整形」バッジを付け、隠さない。',
            ].map((t, i) => (
              <li key={i} className="flex gap-3">
                <span className="font-black text-lime-500">{String(i + 1).padStart(2, '0')}</span>
                <span>{t}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}

function StepTitle({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="bg-surface-950 inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-black text-lime-500">
        {n}
      </span>
      <h2 className="text-ink-950 text-lg font-black">{children}</h2>
    </div>
  )
}
