import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Avatar from '@/components/ui/Avatar'
import { requireOwnerPage } from '@/lib/auth/require-owner'
import { countOpenInquiries } from '@/lib/admin/inbox'

export const metadata: Metadata = { title: '管理画面', robots: { index: false, follow: false } }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const owner = await requireOwnerPage()
  const openInquiries = await countOpenInquiries()
  return (
    <div className="bg-surface-50 min-h-screen">
      <header className="bg-surface-950 sticky top-0 z-40 flex h-[60px] items-center justify-between px-5 sm:px-10">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="flex items-center">
            <Image src="/logo-lockup-dark.svg" alt="Hosokawa Lab 管理画面" width={88} height={26} />
          </Link>
          <span className="text-ink-950 rounded-full bg-lime-500 px-3 py-1 text-[11px] font-black tracking-[0.1em]">
            ADMIN
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-ink-inverse-400 hidden text-[13px] font-bold hover:text-white sm:inline"
          >
            サイトを見る ↗
          </Link>
          <div className="flex items-center gap-2.5 rounded-full border border-white/14 bg-white/8 py-[5px] pr-4 pl-[5px]">
            <Avatar name={owner.login} image={owner.image} size={28} />
            <span className="text-ink-inverse-50 text-[13px] font-bold">{owner.login}</span>
          </div>
        </div>
      </header>
      <div className="flex flex-col lg:flex-row">
        <AdminSidebar openInquiries={openInquiries} />
        <main className="min-w-0 flex-1 px-5 pt-8 pb-24 sm:px-10 lg:px-14 lg:pt-12">
          {children}
        </main>
      </div>
    </div>
  )
}
