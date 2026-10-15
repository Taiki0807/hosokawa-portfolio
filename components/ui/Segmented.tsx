'use client'

type Option<T extends string> = { value: T; label: string }

type Props<T extends string> = {
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
  label: string
  className?: string
}

export default function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  className = '',
}: Props<T>) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={`bg-surface-0 border-brand-200 inline-flex w-fit gap-1 rounded-[14px] border p-1 ${className}`}
    >
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={`focus-visible:outline-brand-500 rounded-[10px] px-5 py-2.5 text-sm font-bold transition-colors focus-visible:outline-2 ${
              active ? 'bg-surface-950 text-ink-inverse-50' : 'text-ink-700 hover:bg-brand-50'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
