import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import AuthSplitLayout from '@/components/auth/AuthSplitLayout'
import GitHubSignInButton from '@/components/auth/GitHubSignInButton'
import { getOwner } from '@/lib/auth/require-owner'
import { safeCallbackUrl } from '@/lib/auth/redirect'

export const metadata: Metadata = { title: '管理者ログイン', robots: { index: false } }

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams
  const callbackUrl = safeCallbackUrl(params.callbackUrl)
  if (await getOwner()) redirect(callbackUrl)
  const hasError = Boolean(params.error)

  return (
    <AuthSplitLayout
      variant="brand"
      hero={
        <div className="flex max-w-[460px] flex-col gap-[18px]">
          <span className="text-xs font-bold tracking-[0.12em] text-lime-500 uppercase">
            Owner console
          </span>
          <h1 className="text-ink-inverse-50 text-[34px] leading-[1.25] font-black sm:text-[44px]">
            毎日の学習と開発を、
            <br />
            ここから記録する。
          </h1>
          <p className="text-brand-200 text-[15px] leading-[1.9]">
            学習・開発ログの記録、目標や資格の更新、公開設定の変更ができる管理画面です。
          </p>
        </div>
      }
    >
      <div className="flex flex-col gap-2.5">
        <span className="bg-surface-950 inline-flex h-12 w-12 items-center justify-center rounded-full text-lime-500">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 018 0v4" />
          </svg>
        </span>
        <h2 className="text-ink-950 mt-1.5 text-[26px] font-black">管理者ログイン</h2>
        <p className="text-ink-600 text-sm leading-[1.8]">
          GitHubアカウントでログインします。パスワードの入力は不要です。
        </p>
      </div>
      <GitHubSignInButton label="GitHubでログイン" redirectTo={callbackUrl} />
      <p className="bg-brand-100 text-brand-700 rounded-[14px] px-4 py-3.5 text-xs leading-[1.8]">
        ログインできるのは、あらかじめ許可した GitHub
        アカウントだけです。それ以外のアカウントでは、ログイン後に拒否されます。
      </p>
      {hasError ? (
        <p role="alert" className="text-danger-600 text-[13px] leading-[1.7] font-bold">
          ログインに失敗しました。時間をおいてもう一度お試しください。
        </p>
      ) : null}
      <Link href="/" className="text-brand-500 text-center text-[13px] font-bold">
        ← 公開サイトに戻る
      </Link>
    </AuthSplitLayout>
  )
}
