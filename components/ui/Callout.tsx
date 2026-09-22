import React from 'react'
import { Info, Sparkle, AlertTriangle, CircleAlert } from 'lucide-react'

type CalloutType = 'info' | 'success' | 'warning' | 'error'

type CalloutProps = {
  type?: CalloutType
  children: React.ReactNode
}

const styles: Record<
  CalloutType,
  {
    border: string
    badge: string
    iconStroke: string
    label: string
    labelColor: string
    Icon: typeof Info
  }
> = {
  info: {
    border: 'border-l-brand-500',
    badge: 'bg-brand-500',
    iconStroke: '#ffffff',
    label: 'Info',
    labelColor: 'text-brand-500',
    Icon: Info,
  },
  success: {
    border: 'border-l-lime-500',
    badge: 'bg-lime-500',
    iconStroke: '#100e18',
    label: 'Tip',
    labelColor: 'text-[#5c6a12]',
    Icon: Sparkle,
  },
  warning: {
    border: 'border-l-amber-600',
    badge: 'bg-amber-600',
    iconStroke: '#ffffff',
    label: 'Warning',
    labelColor: 'text-amber-600',
    Icon: AlertTriangle,
  },
  error: {
    border: 'border-l-red-600',
    badge: 'bg-red-600',
    iconStroke: '#ffffff',
    label: 'Error',
    labelColor: 'text-red-600',
    Icon: CircleAlert,
  },
}

export function Callout({ type = 'info', children }: CalloutProps) {
  const { border, badge, iconStroke, label, labelColor, Icon } = styles[type]

  return (
    <div
      className={`not-prose bg-surface-0 my-5 flex items-start gap-4 rounded-r-2xl border-l-4 px-6 py-5 shadow-[0_20px_40px_-16px_rgba(16,14,24,0.16)] ${border}`}
    >
      <div className={`flex h-8 w-8 flex-none items-center justify-center rounded-full ${badge}`}>
        <Icon className="h-[15px] w-[15px]" style={{ color: iconStroke }} strokeWidth={2.2} />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className={`text-[11px] font-extrabold tracking-[0.08em] uppercase ${labelColor}`}>
          {label}
        </div>
        <div className="[&_code]:text-brand-700 [&_code]:bg-surface-50 [&_code]:border-surface-200 text-[14px] leading-[1.8] text-[#3d3a52] [&_code]:rounded-md [&_code]:border [&_code]:px-2 [&_code]:py-0.5 [&_code]:font-mono [&_code]:font-bold [&>p]:m-0">
          {children}
        </div>
      </div>
    </div>
  )
}

// ---- 使用例（MDX内） ----
// <Callout type="info">
//   display: flex を親要素に指定するだけで子要素が flex アイテムになります。
// </Callout>
//
// <Callout type="success">よく使う組み合わせ：...</Callout>
// <Callout type="warning">注意：...</Callout>
// <Callout type="error">エラーになる例：...</Callout>
