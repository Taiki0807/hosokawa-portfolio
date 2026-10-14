'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { useEffect, useId, useRef, useState } from 'react'
import Avatar from '@/components/ui/Avatar'

type Props = {
  login: string
  image?: string | null
  openInquiries: number | null
}

export default function AccountMenu({ login, image, openInquiries }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const item =
    'text-ink-700 hover:bg-brand-50 focus-visible:outline-brand-500 flex items-center gap-3 rounded-xl px-4 py-[11px] text-sm font-bold transition-colors focus-visible:outline-2'

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        className="bg-surface-950 focus-visible:outline-brand-500 flex items-center gap-2.5 rounded-full py-[5px] pr-4 pl-[5px] focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <Avatar name={login} image={image} />
        <span className="text-ink-inverse-50 text-[13px] font-bold">{login}</span>
        <span aria-hidden="true" className="text-[10px] text-lime-500">
          ▼
        </span>
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className="bg-surface-0 border-surface-200 absolute top-[calc(100%+10px)] right-0 z-30 flex w-[260px] flex-col gap-0.5 rounded-[20px] border p-2.5 shadow-[0_30px_60px_-20px_rgba(16,14,24,0.4)]"
        >
          <div className="border-surface-200 mb-1.5 border-b px-3.5 pt-3 pb-2.5">
            <div className="text-ink-950 text-sm font-black">{login}</div>
            <div className="text-ink-600 text-xs">オーナーとしてログイン中</div>
          </div>
          <Link role="menuitem" href="/admin" className={item} onClick={() => setOpen(false)}>
            管理画面を開く
          </Link>
          <Link
            role="menuitem"
            href="/admin/learning/new"
            className={item}
            onClick={() => setOpen(false)}
          >
            今日の学習を記録する
          </Link>
          <Link role="menuitem" href="/admin/inbox" className={item} onClick={() => setOpen(false)}>
            お問い合わせ
            {openInquiries ? (
              <span className="text-ink-950 ml-auto rounded-full bg-lime-500 px-[9px] py-0.5 text-[11px] font-black">
                <span className="sr-only">未対応 </span>
                {openInquiries}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            role="menuitem"
            className={`${item} text-danger-600 text-left`}
            onClick={() => signOut({ redirectTo: '/' })}
          >
            ログアウト
          </button>
        </div>
      ) : null}
    </div>
  )
}
