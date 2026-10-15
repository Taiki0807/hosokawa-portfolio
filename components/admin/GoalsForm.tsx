'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { saveGoals } from '@/app/admin/settings/actions'
import Segmented from '@/components/ui/Segmented'
import type { GoalKind, GoalSource } from '@/lib/db/schema'
import { FieldError, Notice, btnPrimary, cardClass, inputClass, labelClass } from './ui'

export type CertDraft = {
  name: string
  issuer: string
  examDate: string
  progressMode: 'auto' | 'manual'
  manualProgress: string
  studyTags: string
  targetHours: string
  currentFocus: string
  isNowStudying: boolean
}

export type GoalDraft = {
  kind: GoalKind
  period: string
  label: string
  target: string
  unit: string
  source: GoalSource
  manualValue: string
  /** カンマ区切り */
  studyTags: string
  note: string
}

type Props = { initialCerts: CertDraft[]; initialGoals: GoalDraft[]; year: string; month: string }

const SOURCE_LABELS: Record<GoalSource, string> = {
  'auto:studyDays': '記録した日数（自動）',
  'auto:studyHours': '記録した時間（自動）',
  manual: '手入力',
}

const splitTags = (v: string) =>
  v
    .split(/[,、]/)
    .map((t) => t.trim())
    .filter(Boolean)

export default function GoalsForm({ initialCerts, initialGoals, year, month }: Props) {
  const router = useRouter()
  const [certs, setCerts] = useState(initialCerts)
  const [goals, setGoals] = useState(initialGoals)
  const [pending, start] = useTransition()
  const [message, setMessage] = useState<{ tone: 'error' | 'success'; text: string } | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const updateCert = (i: number, patch: Partial<CertDraft>) =>
    setCerts((cs) =>
      cs.map((c, j) =>
        j === i ? { ...c, ...patch } : patch.isNowStudying ? { ...c, isNowStudying: false } : c
      )
    )
  const updateGoal = (i: number, patch: Partial<GoalDraft>) =>
    setGoals((gs) => gs.map((g, j) => (j === i ? { ...g, ...patch } : g)))

  const save = () =>
    start(async () => {
      setMessage(null)
      const res = await saveGoals({
        certTargets: certs.map((c) => ({
          ...c,
          studyTags: splitTags(c.studyTags),
        })),
        goals: goals.map((g) => ({ ...g, studyTags: splitTags(g.studyTags) })),
      })
      setFieldErrors(res.ok ? {} : (res.fieldErrors ?? {}))
      setMessage(
        res.ok ? { tone: 'success', text: '保存しました。' } : { tone: 'error', text: res.error }
      )
      if (res.ok) router.refresh()
    })

  const goalSection = (kind: GoalKind, title: string, defaultPeriod: string) => (
    <section className={`${cardClass} flex flex-1 flex-col gap-4 p-6 sm:p-7`}>
      <h2 className="text-ink-950 text-base font-black">{title}</h2>
      {goals.map((g, i) =>
        g.kind !== kind ? null : (
          <div key={i} className="border-surface-200 flex flex-col gap-3 border-t pt-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_100px_70px]">
              <div>
                <label className={labelClass} htmlFor={`g-label-${i}`}>
                  項目
                </label>
                <input
                  id={`g-label-${i}`}
                  className={inputClass}
                  value={g.label}
                  onChange={(e) => updateGoal(i, { label: e.target.value })}
                />
                <FieldError message={fieldErrors[`goals.${i}.label`]} />
              </div>
              <div>
                <label className={labelClass} htmlFor={`g-target-${i}`}>
                  目標
                </label>
                <input
                  id={`g-target-${i}`}
                  type="number"
                  min={0}
                  step="any"
                  className={inputClass}
                  value={g.target}
                  onChange={(e) => updateGoal(i, { target: e.target.value })}
                />
                <FieldError message={fieldErrors[`goals.${i}.target`]} />
              </div>
              <div>
                <label className={labelClass} htmlFor={`g-unit-${i}`}>
                  単位
                </label>
                <input
                  id={`g-unit-${i}`}
                  className={inputClass}
                  value={g.unit}
                  onChange={(e) => updateGoal(i, { unit: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-[120px_1fr_120px]">
              <div>
                <label className={labelClass} htmlFor={`g-period-${i}`}>
                  期間
                </label>
                <input
                  id={`g-period-${i}`}
                  className={inputClass}
                  value={g.period}
                  onChange={(e) => updateGoal(i, { period: e.target.value })}
                />
                <FieldError message={fieldErrors[`goals.${i}.period`]} />
              </div>
              <div>
                <label className={labelClass} htmlFor={`g-source-${i}`}>
                  進捗の数え方
                </label>
                <select
                  id={`g-source-${i}`}
                  className={inputClass}
                  value={g.source}
                  onChange={(e) => updateGoal(i, { source: e.target.value as GoalSource })}
                >
                  {Object.entries(SOURCE_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              {g.source === 'manual' ? (
                <div>
                  <label className={labelClass} htmlFor={`g-manual-${i}`}>
                    現在の値
                  </label>
                  <input
                    id={`g-manual-${i}`}
                    type="number"
                    step="any"
                    className={inputClass}
                    value={g.manualValue}
                    onChange={(e) => updateGoal(i, { manualValue: e.target.value })}
                  />
                </div>
              ) : null}
            </div>
            {g.source !== 'manual' ? (
              <div>
                <label className={labelClass} htmlFor={`g-tags-${i}`}>
                  対象のタグ{' '}
                  <span className="text-ink-600 font-medium">
                    （カンマ区切り。空欄なら全部のタグを数えます）
                  </span>
                </label>
                <input
                  id={`g-tags-${i}`}
                  className={inputClass}
                  value={g.studyTags}
                  placeholder="例: MuleSoft, Salesforce"
                  onChange={(e) => updateGoal(i, { studyTags: e.target.value })}
                />
                <FieldError message={fieldErrors[`goals.${i}.studyTags`]} />
              </div>
            ) : null}
            <button
              type="button"
              className="text-danger-600 w-fit text-xs font-bold"
              onClick={() => setGoals((gs) => gs.filter((_, j) => j !== i))}
            >
              この目標を削除
            </button>
          </div>
        )
      )}
      <button
        type="button"
        className="text-brand-500 w-fit text-[13px] font-bold"
        onClick={() =>
          setGoals((gs) => [
            ...gs,
            {
              kind,
              period: defaultPeriod,
              label: '',
              target: '',
              unit: '',
              source: 'manual',
              manualValue: '',
              studyTags: '',
              note: '',
            },
          ])
        }
      >
        ＋ 目標を追加
      </button>
    </section>
  )

  return (
    <div className="flex flex-col gap-6">
      <section className={`${cardClass} flex flex-col gap-5 p-6 sm:p-8`}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-ink-950 text-lg font-black">挑戦中の資格</h2>
          <span className="text-ink-600 text-xs font-bold">
            「NOW STUDYING」にした資格が大きく表示されます
          </span>
        </div>
        <FieldError message={fieldErrors.certTargets} />
        {certs.map((c, i) => (
          <div key={i} className="border-surface-200 flex flex-col gap-4 border-t pt-5">
            <div className="grid gap-4 sm:grid-cols-[1fr_160px_180px]">
              <div>
                <label className={labelClass} htmlFor={`c-name-${i}`}>
                  資格名
                </label>
                <input
                  id={`c-name-${i}`}
                  className={inputClass}
                  value={c.name}
                  onChange={(e) => updateCert(i, { name: e.target.value })}
                />
                <FieldError message={fieldErrors[`certTargets.${i}.name`]} />
              </div>
              <div>
                <label className={labelClass} htmlFor={`c-issuer-${i}`}>
                  発行元
                </label>
                <input
                  id={`c-issuer-${i}`}
                  className={inputClass}
                  value={c.issuer}
                  onChange={(e) => updateCert(i, { issuer: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor={`c-date-${i}`}>
                  受験予定日
                </label>
                <input
                  id={`c-date-${i}`}
                  type="date"
                  className={inputClass}
                  value={c.examDate}
                  onChange={(e) => updateCert(i, { examDate: e.target.value })}
                />
                <FieldError message={fieldErrors[`certTargets.${i}.examDate`]} />
              </div>
            </div>
            <div className="grid items-end gap-4 sm:grid-cols-[auto_1fr]">
              <div>
                <span className={labelClass}>進捗の付け方</span>
                <Segmented
                  label="進捗の付け方"
                  value={c.progressMode}
                  onChange={(v) => updateCert(i, { progressMode: v })}
                  options={[
                    { value: 'auto', label: 'ログと連動' },
                    { value: 'manual', label: '手入力' },
                  ]}
                />
              </div>
              {c.progressMode === 'manual' ? (
                <div className="sm:max-w-[160px]">
                  <label className={labelClass} htmlFor={`c-progress-${i}`}>
                    進捗（％）
                  </label>
                  <input
                    id={`c-progress-${i}`}
                    type="number"
                    min={0}
                    max={100}
                    className={inputClass}
                    value={c.manualProgress}
                    onChange={(e) => updateCert(i, { manualProgress: e.target.value })}
                  />
                  <FieldError message={fieldErrors[`certTargets.${i}.manualProgress`]} />
                </div>
              ) : (
                <div className="sm:max-w-[160px]">
                  <label className={labelClass} htmlFor={`c-hours-${i}`}>
                    目標時間（h）
                  </label>
                  <input
                    id={`c-hours-${i}`}
                    type="number"
                    min={1}
                    className={inputClass}
                    value={c.targetHours}
                    onChange={(e) => updateCert(i, { targetHours: e.target.value })}
                  />
                  <FieldError message={fieldErrors[`certTargets.${i}.targetHours`]} />
                </div>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor={`c-tags-${i}`}>
                  対象のタグ{' '}
                  <span className="text-ink-600 font-medium">
                    （カンマ区切り。今月の学習時間・自動の進捗に使います）
                  </span>
                </label>
                <input
                  id={`c-tags-${i}`}
                  className={inputClass}
                  value={c.studyTags}
                  onChange={(e) => updateCert(i, { studyTags: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor={`c-focus-${i}`}>
                  取り組み中の分野
                </label>
                <input
                  id={`c-focus-${i}`}
                  className={inputClass}
                  value={c.currentFocus}
                  onChange={(e) => updateCert(i, { currentFocus: e.target.value })}
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="text-ink-700 flex items-center gap-2 text-[13px] font-bold">
                <input
                  type="radio"
                  name="now-studying"
                  className="accent-brand-500 h-4 w-4"
                  checked={c.isNowStudying}
                  onChange={() => updateCert(i, { isNowStudying: true })}
                />
                NOW STUDYING にする
              </label>
              <button
                type="button"
                className="text-danger-600 text-xs font-bold"
                onClick={() => setCerts((cs) => cs.filter((_, j) => j !== i))}
              >
                この資格を削除
              </button>
            </div>
          </div>
        ))}
        <p className="text-ink-600 text-xs leading-[1.8]">
          「ログと連動」は、対象のタグの累計学習時間 ÷ 目標時間
          で自動計算します。受験予定日を過ぎた資格はホームに表示されません。
        </p>
        <button
          type="button"
          className="text-brand-500 w-fit text-[13px] font-bold"
          onClick={() =>
            setCerts((cs) => [
              ...cs,
              {
                name: '',
                issuer: '',
                examDate: '',
                progressMode: 'auto',
                manualProgress: '',
                studyTags: '',
                targetHours: '',
                currentFocus: '',
                isNowStudying: cs.length === 0,
              },
            ])
          }
        >
          ＋ 資格を追加
        </button>
      </section>

      <div className="flex flex-col gap-6 lg:flex-row">
        {goalSection('yearly', '年の目標', year)}
        {goalSection('monthly', '月の目標', month)}
      </div>

      {message ? <Notice tone={message.tone}>{message.text}</Notice> : null}
      <div>
        <button type="button" className={btnPrimary} onClick={save} disabled={pending}>
          {pending ? '保存しています…' : '変更を保存'}
        </button>
      </div>
    </div>
  )
}
