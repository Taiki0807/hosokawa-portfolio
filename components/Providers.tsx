'use client'

import { SessionProvider } from 'next-auth/react'
import type { ReactNode } from 'react'

// ログイン状態はクライアント側で取得する（サーバーで auth() を呼ぶと全ページが動的レンダリングになるため）
export default function Providers({ children }: { children: ReactNode }) {
  return <SessionProvider refetchOnWindowFocus={false}>{children}</SessionProvider>
}
