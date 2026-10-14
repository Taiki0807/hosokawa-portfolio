import type { ReactNode } from 'react'
import { BoltIcon } from './icons'

type Props = {
  eyebrow: string
  title: ReactNode
  description?: ReactNode
  className?: string
  titleClassName?: string
}

export default function SectionHeader({
  eyebrow,
  title,
  description,
  className = '',
  titleClassName = '',
}: Props) {
  return (
    <div className={`flex max-w-[720px] flex-col gap-[18px] ${className}`}>
      <div className="text-brand-500 flex items-center gap-2">
        <BoltIcon />
        <span className="text-xs font-bold tracking-[0.12em] uppercase">{eyebrow}</span>
      </div>
      <h2
        className={`text-ink-950 text-[32px] leading-[1.2] font-black sm:text-[44px] ${titleClassName}`}
      >
        {title}
      </h2>
      {description ? <p className="text-ink-700 text-base leading-[1.9]">{description}</p> : null}
    </div>
  )
}
