import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'

type Props = {
  variant: 'brand' | 'dark'
  hero: ReactNode
  children: ReactNode
}

// ログイン・403 の左右 2 分割レイアウト
export default function AuthSplitLayout({ variant, hero, children }: Props) {
  const panel =
    variant === 'brand'
      ? 'bg-linear-135 from-brand-700 via-brand-500 to-brand-400'
      : 'bg-surface-950'
  const lines =
    variant === 'brand'
      ? [
          ['#ffffff', 0.09],
          ['#ffffff', 0.09],
          ['#cbeb4d', 0.85],
        ]
      : [
          ['#7a6fe0', 0.35],
          ['#342c7a', 0.8],
          ['#cbeb4d', 0.6],
        ]
  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      <div
        className={`relative flex flex-col justify-between gap-12 overflow-hidden px-6 py-10 sm:px-12 lg:flex-[1.1] lg:px-[72px] lg:py-14 ${panel}`}
      >
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 800 900"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <g strokeLinecap="round" strokeWidth="40" fill="none">
            {lines.map(([color, opacity], i) => (
              <line
                key={i}
                x1={420 + i * 120}
                y1="980"
                x2={700 + i * 120}
                y2="300"
                stroke={color as string}
                strokeOpacity={opacity as number}
              />
            ))}
          </g>
        </svg>
        <Link href="/" className="relative w-fit">
          <Image src="/logo-lockup-dark.svg" alt="Hosokawa Lab" width={102} height={30} priority />
        </Link>
        <div className="relative">{hero}</div>
        <div
          className={`relative text-xs ${variant === 'brand' ? 'text-brand-200' : 'text-ink-inverse-400'}`}
        >
          © {new Date().getFullYear()} Hosokawa
        </div>
      </div>
      <div className="bg-surface-50 flex flex-1 items-center justify-center px-6 py-12 sm:p-14">
        <div className="bg-surface-0 border-surface-200 flex w-full max-w-[420px] flex-col gap-6 rounded-[28px] border px-6 py-10 shadow-[0_40px_80px_-40px_rgba(16,14,24,0.35)] sm:px-10 sm:py-11">
          {children}
        </div>
      </div>
    </main>
  )
}
