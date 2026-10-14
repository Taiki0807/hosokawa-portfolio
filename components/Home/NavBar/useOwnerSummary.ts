'use client'

import { useEffect, useState } from 'react'

export type OwnerSummary = { openInquiries: number }

/** ログイン中のみ、ナビに出す未対応のお問い合わせ件数を取得する */
export function useOwnerSummary(enabled: boolean): OwnerSummary | null {
  const [summary, setSummary] = useState<OwnerSummary | null>(null)
  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    fetch('/api/admin/summary', { cache: 'no-store' })
      .then((res) => (res.ok ? (res.json() as Promise<OwnerSummary>) : null))
      .then((data) => {
        if (!cancelled) setSummary(data)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [enabled])
  return summary
}
