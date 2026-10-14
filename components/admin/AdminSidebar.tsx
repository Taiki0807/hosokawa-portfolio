'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Item = { href: string; label: string; badge?: number; exact?: boolean }

const GROUPS: { label?: string; items: Item[] }[] = [
  { items: [{ href: '/admin', label: '概要', exact: true }] },
  {
    label: '学習',
    items: [
      { href: '/admin/learning/new', label: '学習を記録', exact: true },
      { href: '/admin/learning', label: '記録一覧' },
      { href: '/admin/review', label: 'AIレビュー' },
    ],
  },
  {
    label: 'コンテンツ',
    items: [
      { href: '/admin/works', label: '成果物・ブログ' },
      { href: '/admin/skills', label: 'スキル・資格' },
    ],
  },
  { label: '受信', items: [{ href: '/admin/inbox', label: 'お問い合わせ' }] },
  {
    label: '設定',
    items: [
      { href: '/admin/settings/goals', label: '目標と資格' },
      { href: '/admin/settings/publish', label: '公開とAIの設定' },
      { href: '/admin/settings/account', label: 'アカウント' },
    ],
  },
]

function isActive(pathname: string, item: Item) {
  if (item.exact) return pathname === item.href
  if (item.href === '/admin/learning') {
    return pathname === '/admin/learning' || /^\/admin\/learning\/\d+/.test(pathname)
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

export default function AdminSidebar({ openInquiries }: { openInquiries: number }) {
  const pathname = usePathname()
  return (
    <nav
      aria-label="管理メニュー"
      className="bg-surface-0 border-surface-200 flex flex-none gap-0.5 overflow-x-auto border-b px-4 py-3 lg:sticky lg:top-[60px] lg:h-[calc(100vh-60px)] lg:w-[260px] lg:flex-col lg:overflow-y-auto lg:border-r lg:border-b-0 lg:px-5 lg:pt-6 lg:pb-8"
    >
      {GROUPS.map((group, gi) => (
        <div key={gi} className="flex flex-none gap-0.5 lg:flex-col">
          {group.label ? (
            <div className="text-ink-600 hidden px-4 pt-[18px] pb-1.5 text-[11px] font-black tracking-[0.1em] lg:block">
              {group.label}
            </div>
          ) : null}
          {group.items.map((item) => {
            const active = isActive(pathname, item)
            const badge = item.href === '/admin/inbox' ? openInquiries : 0
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`focus-visible:outline-brand-500 flex flex-none items-center gap-3 rounded-xl px-4 py-[11px] text-sm font-bold whitespace-nowrap transition-colors focus-visible:outline-2 ${
                  active ? 'bg-brand-100 text-brand-700' : 'text-ink-700 hover:bg-brand-50'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`h-2 w-2 flex-none rounded-full ${active ? 'bg-brand-500' : 'bg-brand-200'}`}
                />
                {item.label}
                {badge ? (
                  <span className="text-ink-950 ml-auto rounded-full bg-lime-500 px-[9px] py-0.5 text-[11px] font-black">
                    <span className="sr-only">未対応 </span>
                    {badge}
                  </span>
                ) : null}
              </Link>
            )
          })}
        </div>
      ))}
      <Link
        href="/admin/learning/new"
        className="text-ink-950 mt-[18px] hidden items-center justify-center gap-2 rounded-[14px] bg-lime-500 px-4 py-3.5 text-[13px] font-black lg:flex"
      >
        ＋ 今日の学習を記録
      </Link>
    </nav>
  )
}
