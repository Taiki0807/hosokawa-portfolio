import Link from 'next/link'
import { getAllPosts } from '@/lib/content'

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <div>
      <div className="mb-9">
        <h1 className="text-ink-950 mb-1.5 text-2xl font-black tracking-tight sm:text-3xl">Blog</h1>
        <p className="text-ink-600 text-sm">技術や日々の学びについて書いています。</p>
      </div>

      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="border-surface-200 bg-surface-0 block rounded-2xl border p-5 shadow-[0_20px_40px_-16px_rgba(16,14,24,0.1)] transition hover:-translate-y-0.5"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="border-surface-200 bg-surface-0 text-ink-950 inline-block rounded-full border px-3 py-0.5 text-xs font-bold">
                {post.category}
              </span>
              <span className="text-ink-600 text-xs">
                {post.date} · {post.readingTime} min
              </span>
            </div>

            <h2 className="text-ink-950 mb-1.5 text-base font-bold">{post.title}</h2>

            {post.excerpt && (
              <p className="text-ink-600 mb-2 text-sm leading-relaxed">{post.excerpt}</p>
            )}

            {post.tags && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-surface-50 text-ink-600 rounded-full px-2.5 py-0.5 text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
