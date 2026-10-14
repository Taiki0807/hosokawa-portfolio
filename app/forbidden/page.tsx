import type { Metadata } from 'next'
import Link from 'next/link'
import AuthSplitLayout from '@/components/auth/AuthSplitLayout'
import Avatar from '@/components/ui/Avatar'
import { GitHubIcon } from '@/components/ui/icons'
import { safeGitHubLogin } from '@/lib/auth/redirect'

export const metadata: Metadata = { title: 'アクセス拒否', robots: { index: false } }

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function ForbiddenPage({ searchParams }: Props) {
  const login = safeGitHubLogin((await searchParams).login)

  return (
    <AuthSplitLayout
      variant="dark"
      hero={
        <div className="flex flex-col gap-3.5">
          <span className="text-[88px] leading-none font-black text-lime-500 sm:text-[120px]">
            403
          </span>
          <h1 className="text-ink-inverse-50 text-[26px] leading-[1.35] font-black sm:text-[32px]">
            この先は、オーナー専用です。
          </h1>
        </div>
      }
    >
      <h2 className="text-ink-950 text-2xl font-black">このアカウントには管理権限がありません</h2>
      {login ? (
        <div className="bg-surface-50 flex items-center gap-3 rounded-[14px] px-4 py-3">
          <Avatar name={login} size={36} className="from-surface-200 to-surface-200 text-ink-700" />
          <div>
            <div className="text-ink-950 text-sm font-black">{login}</div>
            <div className="text-ink-600 text-xs">GitHubでログインしようとしたアカウント</div>
          </div>
        </div>
      ) : null}
      <p className="text-ink-600 text-sm leading-[1.9]">
        ログインできるのは、サイトのオーナーとして許可された GitHub
        アカウントだけです。心当たりがある場合は、GitHub
        で別のアカウントに切り替えてから、ログインし直してください。
      </p>
      <Link
        href="/login"
        className="bg-surface-950 text-ink-inverse-50 focus-visible:outline-brand-500 flex items-center justify-center gap-2 rounded-2xl px-6 py-[15px] text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <GitHubIcon />
        別のアカウントでログイン
      </Link>
      <Link href="/" className="text-brand-500 text-center text-[13px] font-bold">
        ← 公開サイトに戻る
      </Link>
    </AuthSplitLayout>
  )
}
