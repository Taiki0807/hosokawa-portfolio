import Link from 'next/link'
import { getPostsByCategory } from '@/lib/content'

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  const grouped = getPostsByCategory()

  return (
    <div className="flex min-h-screen pt-28">
      {/* サイドバー */}
      <aside className="sticky top-28 hidden h-[calc(100vh-7rem)] w-64 shrink-0 overflow-y-auto border-r border-purple-100 bg-white/60 px-4 py-8 backdrop-blur md:block">
        {Object.entries(grouped).map(([category, posts]) => (
          <div key={category} className="mb-6">
            <div className="mb-1.5 px-2 text-xs font-bold tracking-wider text-gray-400 uppercase">
              {category}
            </div>
            <div>
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="block rounded-md px-2.5 py-1.5 text-sm text-gray-500 transition hover:bg-purple-50 hover:text-purple-600"
                >
                  {post.title}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </aside>

      {/* メインコンテンツ */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10 sm:px-12">{children}</main>
    </div>
  )
}
