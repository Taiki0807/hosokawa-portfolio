'use client'

import Link from 'next/link'
import { useEffect, useId, useRef, useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import SignOutButton from '@/components/ui/SignOutButton'

type Props = {
  login: string
  image?: string | null
  openInquiries: number | null
  /** site: 公開ページのナビ / admin: 管理画面のヘッダー */
  variant?: 'site' | 'admin'
}

export default function AccountMenu({ login, image, openInquiries, variant = 'site' }: Props) {
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
        aria-label={`${login}のアカウントメニュー`}
        className={`focus-visible:outline-brand-500 flex items-center gap-2.5 rounded-full py-[5px] pr-4 pl-[5px] focus-visible:outline-2 focus-visible:outline-offset-2 ${
          variant === 'admin'
            ? 'border border-white/14 bg-white/8 hover:bg-white/14'
            : 'bg-surface-950'
        }`}
      >
        <Avatar name={login} image={image} size={variant === 'admin' ? 28 : 32} />
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
          {variant === 'admin' ? (
            <>
              <Link role="menuitem" href="/" className={item} onClick={() => setOpen(false)}>
                サイトを見る
              </Link>
              <Link
                role="menuitem"
                href="/admin/settings/account"
                className={item}
                onClick={() => setOpen(false)}
              >
                アカウント設定
              </Link>
            </>
          ) : (
            <>
              <Link role="menuitem" href="/admin" className={item} onClick={() => setOpen(false)}>
                管理画面を開く
              </Link>
              <Link
                role="menuitem"
                href="/admin/learning/new"
                className={item}
                onClick={() => setOpen(false)}
              >
                記録を書く
              </Link>
            </>
          )}
          <Link role="menuitem" href="/admin/inbox" className={item} onClick={() => setOpen(false)}>
            お問い合わせ
            {openInquiries ? (
              <span className="text-ink-950 ml-auto rounded-full bg-lime-500 px-[9px] py-0.5 text-[11px] font-black">
                <span className="sr-only">未対応 </span>
                {openInquiries}
              </span>
            ) : null}
          </Link>
          <SignOutButton role="menuitem" className={`${item} text-danger-600 w-full text-left`} />
        </div>
      ) : null}
    </div>
  )
}
