'use client'

type Props = {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  name?: string
  disabled?: boolean
}

export default function Toggle({ checked, onChange, label, name, disabled }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`focus-visible:outline-brand-500 relative inline-flex h-7 w-12 flex-none items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 ${
        checked ? 'bg-brand-500' : 'bg-surface-200'
      }`}
    >
      {name ? <input type="hidden" name={name} value={checked ? 'on' : ''} /> : null}
      <span
        className={`bg-surface-0 inline-block h-5 w-5 rounded-full shadow transition-transform motion-reduce:transition-none ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}
