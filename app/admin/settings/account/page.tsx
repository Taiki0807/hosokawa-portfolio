import Avatar from '@/components/ui/Avatar'
import SignOutButton from '@/components/admin/SignOutButton'
import { PageHeader, btnSecondary, cardClass } from '@/components/admin/ui'
import { requireOwnerPage } from '@/lib/auth/require-owner'
import { parseAllowlist } from '@/lib/auth/allowlist'

export default async function AccountPage() {
  const owner = await requireOwnerPage()
  const allowlist = parseAllowlist(process.env.ALLOWED_GITHUB_LOGINS)
  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="アカウント"
        description="ログイン方法と、管理画面に入れる人の設定です。"
      />
      <div className="flex flex-col gap-6">
        <section className={`${cardClass} flex flex-wrap items-center gap-4 p-6 sm:p-8`}>
          <Avatar name={owner.login} image={owner.image} size={48} />
          <div className="min-w-0 flex-1">
            <div className="text-ink-950 text-lg font-black">{owner.login}</div>
            <div className="text-ink-600 text-xs">GitHubでログイン中</div>
          </div>
          <SignOutButton />
        </section>

        <section className={`${cardClass} p-6 sm:p-8`}>
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-ink-950 text-lg font-black">ログインを許可するアカウント</h2>
            <span className="text-ink-600 text-xs font-bold">
              ここにないアカウントは拒否されます
            </span>
          </div>
          <ul>
            {allowlist.map((login) => (
              <li
                key={login}
                className="border-surface-200 flex items-center justify-between border-t py-3.5"
              >
                <span className="text-ink-950 text-sm font-bold">{login}</span>
                {login === owner.login.toLowerCase() ? (
                  <span className="bg-brand-100 text-brand-700 rounded-full px-3 py-1 text-[11px] font-black">
                    あなた
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
          <p className="bg-brand-100 text-brand-700 mt-3 rounded-[14px] px-4 py-3 text-xs leading-[1.8]">
            許可するアカウントは、画面からは変更できません。Vercel の環境変数{' '}
            <code>ALLOWED_GITHUB_LOGINS</code>
            （カンマ区切り）を変更し、再デプロイしてください。外したアカウントは、次のアクセスから拒否されます。
          </p>
        </section>

        <section
          className={`${cardClass} flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8`}
        >
          <div>
            <h2 className="text-ink-950 text-lg font-black">データのエクスポート</h2>
            <p className="text-ink-600 mt-1 text-xs leading-[1.8]">
              学習ログ全件を、JSON または Markdown でバックアップできます。
            </p>
          </div>
          <div className="flex gap-2.5">
            <a className={btnSecondary} href="/api/admin/export?format=json" download>
              JSON
            </a>
            <a className={btnSecondary} href="/api/admin/export?format=md" download>
              Markdown
            </a>
          </div>
        </section>
      </div>
    </>
  )
}
