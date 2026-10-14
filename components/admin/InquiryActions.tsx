'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { setInquiryStatus } from '@/app/admin/inbox/actions'
import { btnGhost } from './ui'

type Props = { id: number; status: 'open' | 'done' | 'spam' }

export default function InquiryActions({ id, status }: Props) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const set = (next: Props['status']) =>
    start(async () => {
      const res = await setInquiryStatus({ id, status: next })
      if (!res.ok) return setError(res.error)
      router.refresh()
    })

  return (
    <>
      <button
        type="button"
        className={btnGhost}
        disabled={pending}
        onClick={() => set(status === 'done' ? 'open' : 'done')}
      >
        {status === 'done' ? '未対応に戻す' : '対応済みにする'}
      </button>
      <button
        type="button"
        className={`${btnGhost} text-danger-600 ml-auto border-[#e9b4af]`}
        disabled={pending}
        onClick={() => set(status === 'spam' ? 'open' : 'spam')}
      >
        {status === 'spam' ? '迷惑メールではない' : '迷惑メールとして報告'}
      </button>
      {error ? <p className="text-danger-600 w-full text-xs font-bold">{error}</p> : null}
    </>
  )
}
