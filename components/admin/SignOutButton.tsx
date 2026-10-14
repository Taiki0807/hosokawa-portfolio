'use client'

import { signOut } from 'next-auth/react'
import { btnSecondary } from './ui'

export default function SignOutButton() {
  return (
    <button type="button" className={btnSecondary} onClick={() => signOut({ redirectTo: '/' })}>
      ログアウト
    </button>
  )
}
