import type { ReactNode } from 'react'

// 管理画面で使う見た目のクラス（デザインの .btn-primary / .btn-secondary / .btn-ghost / .input）
export const btnPrimary =
  'text-ink-950 inline-flex items-center justify-center gap-2 rounded-full bg-lime-500 px-7 py-3.5 text-[13px] font-bold tracking-[0.06em] transition hover:shadow-[0_12px_24px_-8px_rgba(91,79,224,0.28)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:opacity-50'
export const btnSecondary =
  'border-ink-600 text-ink-950 inline-flex items-center justify-center gap-2 rounded-2xl border-[1.5px] bg-transparent px-[27px] py-[13px] text-[13px] font-bold tracking-[0.06em] transition-colors hover:border-brand-500 hover:text-brand-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:opacity-50'
export const btnGhost =
  'border-ink-600 text-ink-950 inline-flex items-center gap-2 rounded-xl border-[1.5px] bg-transparent px-[18px] py-[9px] text-[13px] font-bold focus-visible:outline-2 focus-visible:outline-brand-500 disabled:opacity-50'
export const btnDanger =
  'bg-danger-600 inline-flex items-center rounded-xl px-5 py-2.5 text-[13px] font-black text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger-600 disabled:opacity-50'
export const inputClass =
  'border-brand-200 text-ink-950 w-full rounded-xl border-[1.5px] bg-white px-4 py-[13px] text-[15px] focus:outline-2 focus:outline-offset-1 focus:outline-brand-500 aria-[invalid=true]:border-danger-600'
export const labelClass = 'text-ink-700 mb-2 block text-xs font-bold'
export const cardClass =
  'bg-surface-0 border-surface-200 rounded-3xl border shadow-[var(--shadow-soft)]'

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-brand-500 text-xs font-bold tracking-[0.12em] uppercase">
          {eyebrow}
        </span>
        <h1 className="text-ink-950 text-[28px] font-black sm:text-[32px]">{title}</h1>
        {description ? (
          <p className="text-ink-600 max-w-[680px] text-sm leading-[1.8]">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  )
}

const STATUS_STYLES = {
  published: ['公開中', 'bg-brand-100 text-brand-700'],
  draft: ['下書き', 'bg-[#f7ecb5] text-[#5c4a00]'],
  private: ['非公開', 'bg-surface-200 text-ink-700'],
} as const

export function StatusPill({ status }: { status: keyof typeof STATUS_STYLES }) {
  const [label, cls] = STATUS_STYLES[status]
  return (
    <span className={`rounded-full px-[11px] py-1 text-[11px] font-black whitespace-nowrap ${cls}`}>
      {label}
    </span>
  )
}

export function FieldError({ message, id }: { message?: string; id?: string }) {
  if (!message) return null
  return (
    <p id={id} className="text-danger-600 mt-1.5 text-xs font-bold">
      {message}
    </p>
  )
}

export function Notice({
  tone = 'info',
  children,
}: {
  tone?: 'info' | 'error' | 'success'
  children: ReactNode
}) {
  const cls = {
    info: 'bg-brand-100 text-brand-700',
    error: 'bg-[#fde4e1] text-danger-600',
    success: 'bg-[#eef6cf] text-lime-ink',
  }[tone]
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`rounded-[14px] px-4 py-3 text-[13px] leading-[1.7] font-bold ${cls}`}
    >
      {children}
    </div>
  )
}
