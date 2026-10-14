import type { ReactNode } from 'react'

type Props = { children: ReactNode; className?: string }

export default function Tag({ children, className = '' }: Props) {
  return (
    <span
      className={`bg-brand-100 text-brand-700 inline-flex items-center rounded-full px-[11px] py-1 text-xs font-bold ${className}`}
    >
      {children}
    </span>
  )
}
