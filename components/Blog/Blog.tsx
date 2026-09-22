import Link from 'next/link'
import { Zap, ArrowRight } from 'lucide-react'
import { getAllPosts } from '@/lib/content'

const Blog = () => {
  const posts = getAllPosts().slice(0, 1)

  if (posts.length === 0) return null

  return (
    <div id="blog" className="flex flex-col gap-8 px-6 pb-16 sm:px-10 lg:px-20">
      <div className="flex items-center gap-2">
        <Zap className="fill-brand-500 text-brand-500 h-3.5 w-3.5" />
        <span className="text-brand-500 text-xs font-bold tracking-[0.12em] uppercase">
          Latest from the blog
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="bg-surface-0 flex items-center justify-between rounded-[20px] px-8 py-6 shadow-[0_20px_40px_-16px_rgba(16,14,24,0.16)] transition-transform hover:-translate-y-0.5"
          >
            <div className="flex flex-col gap-1">
              <div className="text-ink-950 text-[17px] font-bold">{post.title}</div>
              <div className="text-ink-600 text-[13px]">{post.date}</div>
            </div>
            <span className="bg-surface-950 flex h-10 w-10 flex-none items-center justify-center rounded-full text-lime-500">
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </div>

      <Link
        href="/blog"
        className="text-brand-500 hover:text-brand-700 inline-flex w-fit items-center gap-1.5 text-sm font-bold transition-colors"
      >
        すべての記事を見る
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  )
}

export default Blog
