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
  // 指定がなければ既定の大きさ。指定したときは置き換える（クラスの競合を避ける）
  titleClassName = 'text-[32px] leading-[1.2] sm:text-[44px]',
}: Props) {
  return (
    <div className={`flex max-w-[720px] flex-col gap-[18px] ${className}`}>
      <div className="text-brand-500 flex items-center gap-2">
        <BoltIcon />
        <span className="text-xs font-bold tracking-[0.12em] uppercase">{eyebrow}</span>
      </div>
      <h2 className={`text-ink-950 font-black ${titleClassName}`}>{title}</h2>
      {description ? <p className="text-ink-700 text-base leading-[1.9]">{description}</p> : null}
    </div>
  )
}
