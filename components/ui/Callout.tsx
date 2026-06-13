import React from 'react'

type CalloutType = 'info' | 'success' | 'warning' | 'error'

type CalloutProps = {
  type?: CalloutType
  children: React.ReactNode
}

const styles: Record<CalloutType, { box: string; icon: string }> = {
  info: {
    box: 'bg-blue-50 border-blue-200 text-blue-700',
    icon: 'ℹ️',
  },
  success: {
    box: 'bg-green-50 border-green-200 text-green-700',
    icon: '✅',
  },
  warning: {
    box: 'bg-orange-50 border-orange-200 text-orange-700',
    icon: '⚠️',
  },
  error: {
    box: 'bg-red-50 border-red-200 text-red-700',
    icon: '🚫',
  },
}

export function Callout({ type = 'info', children }: CalloutProps) {
  const style = styles[type]

  return (
    <div
      className={`my-4 flex items-start gap-2.5 rounded-lg border px-4 py-3.5 text-sm ${style.box}`}
    >
      <span className="mt-0.5 shrink-0">{style.icon}</span>
      <div className="[&>p]:m-0 [&>p]:text-inherit">{children}</div>
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
