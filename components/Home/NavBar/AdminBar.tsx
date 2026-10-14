import Link from 'next/link'

export default function AdminBar() {
  return (
    <div className="text-ink-950 flex flex-col gap-1 bg-lime-500 px-6 py-2 text-xs font-bold sm:flex-row sm:items-center sm:justify-between sm:px-10">
      <span>管理者としてログイン中です。公開中のページと同じ見た目で表示しています。</span>
      <span className="flex gap-5">
        <Link href="/admin" className="underline">
          管理画面へ
        </Link>
        <Link href="/admin/learning/new" className="underline">
          学習を記録
        </Link>
      </span>
    </div>
  )
}
