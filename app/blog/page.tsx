import Link from 'next/link'
import { getAllPosts } from '@/lib/content'

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <div>
      <div className="mb-9">
        <h1 className="mb-1.5 text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
          Blog
        </h1>
        <p className="text-sm text-gray-500">技術や日々の学びについて書いています。</p>
      </div>

      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block rounded-2xl border border-purple-100 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-block rounded-full border border-purple-200 bg-purple-50 px-3 py-0.5 font-mono text-xs font-bold text-purple-600">
                {post.category}
              </span>
              <span className="font-mono text-xs text-gray-400">
                {post.date} · {post.readingTime} min
              </span>
            </div>

            <h2 className="mb-1.5 text-base font-bold text-gray-900">{post.title}</h2>

            {post.excerpt && (
              <p className="mb-2 text-sm leading-relaxed text-gray-500">{post.excerpt}</p>
            )}

            {post.tags && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-gray-100 px-2.5 py-0.5 font-mono text-xs text-gray-500"
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
