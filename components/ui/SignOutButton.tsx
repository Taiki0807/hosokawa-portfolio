'use client'

import { useTransition } from 'react'
import { signOutAction } from '@/lib/auth/actions'

type Props = { className?: string; role?: 'menuitem' }

export default function SignOutButton({ className, role }: Props) {
  const [pending, startTransition] = useTransition()
  return (
    <button
      type="button"
      role={role}
      disabled={pending}
      className={className}
      onClick={() =>
        startTransition(async () => {
          await signOutAction()
          // ナビのセッション表示を確実に消すため、ページごと読み込み直す
          window.location.assign('/')
        })
      }
    >
      {pending ? 'ログアウト中…' : 'ログアウト'}
    </button>
  )
}
