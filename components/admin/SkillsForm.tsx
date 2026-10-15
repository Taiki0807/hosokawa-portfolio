'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { saveSkillsAndCertifications } from '@/app/admin/skills/actions'
import type { SkillCategory } from '@/lib/db/schema'
import ImageUpload from './ImageUpload'
import { FieldError, Notice, btnGhost, btnPrimary, cardClass, inputClass, labelClass } from './ui'

export type SkillDraft = {
  name: string
  category: SkillCategory
  years: string
  description: string
}
export type CertDraft = {
  name: string
  issuer: string
  earnedOn: string
  expiresOn: string
  badgeUrl: string
  credentialUrl: string
}

const CATEGORY: Record<SkillCategory, { label: string; cls: string }> = {
  core: { label: 'コア', cls: 'bg-surface-950 text-lime-500' },
  experience: { label: '経験', cls: 'bg-brand-100 text-brand-700' },
  learning: { label: '学習中', cls: 'bg-lime-500 text-ink-950' },
}
const ORDER: SkillCategory[] = ['core', 'experience', 'learning']

export default function SkillsForm({
  initialSkills,
  initialCerts,
}: {
  initialSkills: SkillDraft[]
  initialCerts: CertDraft[]
}) {
  const router = useRouter()
  const [skills, setSkills] = useState(initialSkills)
  const [certs, setCerts] = useState(initialCerts)
  const [pending, start] = useTransition()
  const [message, setMessage] = useState<{ tone: 'error' | 'success'; text: string } | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const setSkill = (i: number, patch: Partial<SkillDraft>) =>
    setSkills((xs) => xs.map((x, j) => (j === i ? { ...x, ...patch } : x)))
  const setCert = (i: number, patch: Partial<CertDraft>) =>
    setCerts((xs) => xs.map((x, j) => (j === i ? { ...x, ...patch } : x)))

  const save = () =>
    start(async () => {
      const res = await saveSkillsAndCertifications({ skills, certifications: certs })
      setErrors(res.ok ? {} : (res.fieldErrors ?? {}))
      setMessage(
        res.ok ? { tone: 'success', text: '保存しました。' } : { tone: 'error', text: res.error }
      )
      if (res.ok) router.refresh()
    })

  const saveButton = (
    <button type="button" className={btnPrimary} onClick={save} disabled={pending}>
      {pending ? '保存しています…' : '変更を保存'}
    </button>
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">{saveButton}</div>
      {message ? <Notice tone={message.tone}>{message.text}</Notice> : null}

      <section className={`${cardClass} p-6 sm:p-8`}>
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-ink-950 text-lg font-black">スキル</h2>
          <span className="text-ink-600 text-xs font-bold">
            区分のボタンで コア／経験／学習中 を切り替え
          </span>
        </div>
        <div className="text-ink-600 hidden grid-cols-[160px_96px_110px_1fr_40px] gap-4 pb-2 text-[11px] font-black tracking-[0.08em] md:grid">
          <span>技術</span>
          <span>区分</span>
          <span>経験年数</span>
          <span>ホバー時に出るコメント</span>
          <span />
        </div>
        <ul className="flex flex-col">
          {skills.map((s, i) => (
            <li
              key={i}
              className="border-surface-200 grid grid-cols-1 items-center gap-3 border-t py-3 md:grid-cols-[160px_96px_110px_1fr_40px] md:gap-4"
            >
              <div>
                <input
                  aria-label="技術名"
                  className={`${inputClass} py-2.5 text-sm`}
                  value={s.name}
                  onChange={(e) => setSkill(i, { name: e.target.value })}
                />
                <FieldError message={errors[`skills.${i}.name`]} />
              </div>
              <button
                type="button"
                aria-label={`区分：${CATEGORY[s.category].label}（クリックで切り替え）`}
                onClick={() =>
                  setSkill(i, { category: ORDER[(ORDER.indexOf(s.category) + 1) % ORDER.length] })
                }
                className={`w-fit rounded-full px-4 py-2 text-xs font-black ${CATEGORY[s.category].cls}`}
              >
                {CATEGORY[s.category].label}
              </button>
              <input
                aria-label="経験年数"
                type="number"
                min={0}
                step="0.5"
                placeholder="例：3"
                className={`${inputClass} py-2.5 text-sm`}
                value={s.years}
                onChange={(e) => setSkill(i, { years: e.target.value })}
              />
              <input
                aria-label="ホバー時に出るコメント"
                placeholder="どんな場面で使ったか、一言"
                className={`${inputClass} py-2.5 text-sm`}
                value={s.description}
                onChange={(e) => setSkill(i, { description: e.target.value })}
              />
              <button
                type="button"
                aria-label={`${s.name || 'このスキル'}を削除`}
                className="text-danger-600 text-lg font-black"
                onClick={() => setSkills((xs) => xs.filter((_, j) => j !== i))}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            className={btnGhost}
            onClick={() =>
              setSkills((xs) => [
                ...xs,
                { name: '', category: 'learning', years: '', description: '' },
              ])
            }
          >
            ＋ スキルを追加
          </button>
          <span className="text-ink-600 text-xs">
            経験年数は未入力のとき、ホームには表示されません。コア・経験は内側の軌道、学習中は外側の軌道に表示します。
          </span>
        </div>
      </section>

      <h2 className="text-ink-950 mt-2 text-lg font-black">資格</h2>
      {certs.map((c, i) => (
        <section key={i} className={`${cardClass} flex flex-col gap-5 p-6 sm:flex-row sm:p-8`}>
          <ImageUpload
            label="バッジ画像"
            prefix="badges"
            value={c.badgeUrl}
            onChange={(url) => setCert(i, { badgeUrl: url })}
          />
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <FieldError message={errors[`certifications.${i}.badgeUrl`]} />
            <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
              <div>
                <label className={labelClass} htmlFor={`cert-name-${i}`}>
                  資格名
                </label>
                <input
                  id={`cert-name-${i}`}
                  className={inputClass}
                  value={c.name}
                  onChange={(e) => setCert(i, { name: e.target.value })}
                />
                <FieldError message={errors[`certifications.${i}.name`]} />
              </div>
              <div>
                <label className={labelClass} htmlFor={`cert-issuer-${i}`}>
                  発行元
                </label>
                <input
                  id={`cert-issuer-${i}`}
                  className={inputClass}
                  value={c.issuer}
                  onChange={(e) => setCert(i, { issuer: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-[150px_150px_1fr]">
              <div>
                <label className={labelClass} htmlFor={`cert-earned-${i}`}>
                  取得日
                </label>
                <input
                  id={`cert-earned-${i}`}
                  placeholder="YYYY-MM"
                  className={inputClass}
                  value={c.earnedOn}
                  onChange={(e) => setCert(i, { earnedOn: e.target.value })}
                />
                <FieldError message={errors[`certifications.${i}.earnedOn`]} />
              </div>
              <div>
                <label className={labelClass} htmlFor={`cert-exp-${i}`}>
                  有効期限
                </label>
                <input
                  id={`cert-exp-${i}`}
                  placeholder="YYYY-MM-DD"
                  className={inputClass}
                  value={c.expiresOn}
                  onChange={(e) => setCert(i, { expiresOn: e.target.value })}
                />
                <FieldError message={errors[`certifications.${i}.expiresOn`]} />
              </div>
              <div>
                <label className={labelClass} htmlFor={`cert-url-${i}`}>
                  検証URL（バッジの証明ページ）
                </label>
                <input
                  id={`cert-url-${i}`}
                  placeholder="https://…"
                  className={inputClass}
                  value={c.credentialUrl}
                  onChange={(e) => setCert(i, { credentialUrl: e.target.value })}
                />
                <FieldError message={errors[`certifications.${i}.credentialUrl`]} />
              </div>
            </div>
            <button
              type="button"
              className="text-danger-600 w-fit text-xs font-bold"
              onClick={() => setCerts((xs) => xs.filter((_, j) => j !== i))}
            >
              この資格を削除
            </button>
          </div>
        </section>
      ))}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          className={btnGhost}
          onClick={() =>
            setCerts((xs) => [
              ...xs,
              {
                name: '',
                issuer: '',
                earnedOn: '',
                expiresOn: '',
                badgeUrl: '',
                credentialUrl: '',
              },
            ])
          }
        >
          ＋ 資格を追加
        </button>
        {saveButton}
      </div>
    </div>
  )
}
