type Props = {
  /** 0〜100 */
  percent: number
  label: string
  variant?: 'brand' | 'lime-on-dark'
  size?: 'sm' | 'md'
  className?: string
}

export default function ProgressBar({
  percent,
  label,
  variant = 'brand',
  size = 'sm',
  className = '',
}: Props) {
  const value = Math.min(100, Math.max(0, Math.round(percent)))
  const track = variant === 'lime-on-dark' ? 'bg-ink-inverse-50/22' : 'bg-surface-200'
  const fill =
    variant === 'lime-on-dark' ? 'bg-lime-500' : 'bg-linear-to-r from-brand-400 to-brand-500'
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      className={`${size === 'md' ? 'h-2.5' : 'h-2'} overflow-hidden rounded-full ${track} ${className}`}
    >
      <div className={`h-full rounded-full ${fill}`} style={{ width: `${value}%` }} />
    </div>
  )
}
