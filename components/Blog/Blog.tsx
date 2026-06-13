import Link from 'next/link'
import SectionHeading from '../Helper/SectionHeading'
import { getAllPosts } from '@/lib/content'

const Blog = () => {
  const posts = getAllPosts().slice(0, 3) // 最新3件

  if (posts.length === 0) return null

  return (
    <div className="bg-gray-100 py-16">
      <div className="mx-auto flex max-w-5xl flex-col items-start px-6">
        <SectionHeading
          tag="// Blog"
          title="ブログ"
          description="技術や日々の学びについて書いています。"
        />

        <div className="flex w-full justify-center">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="mb-3 inline-block rounded-full border border-purple-200 bg-purple-50 px-3 py-0.5 font-mono text-xs font-bold text-purple-600">
                  {post.category}
                </span>
                <h3 className="mb-2 text-base font-bold text-gray-900">{post.title}</h3>
                {post.excerpt && (
                  <p className="mb-3 text-sm leading-relaxed text-gray-500">{post.excerpt}</p>
                )}
                <span className="font-mono text-xs text-gray-400">{post.date}</span>
              </Link>
            ))}
          </div>
        </div>

        <Link
          href="/blog"
          className="mt-8 inline-flex items-center gap-1 rounded-lg border border-purple-200 px-4 py-2 text-sm font-bold text-purple-600 transition hover:bg-purple-50"
        >
          → すべての記事を見る
        </Link>
      </div>
    </div>
  )
}

export default Blog
