import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { ArrowLeft } from 'lucide-react'
import { getPostBySlug, getAllPostSlugs } from '@/lib/content'
import { Callout } from '@/components/ui/Callout'
import { CodePreview } from '@/components/ui/CodePreview'
import { proseClassName } from '@/components/ui/prose'
import { mdxOptions } from '@/lib/mdx'

const mdxComponents = {
  Callout,
  CodePreview,
}

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }))
}

type Props = {
  params: Promise<{ slug: string }>
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params

  let post
  try {
    post = getPostBySlug(slug)
  } catch {
    notFound()
  }

  const { frontmatter, content } = post

  return (
    <article>
      <Link
        href="/blog"
        className="text-brand-500 mb-5 inline-flex items-center gap-1.5 text-[13px] font-bold"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Blog
      </Link>

      <div className="mb-4 flex items-center gap-2">
        <span className="text-brand-500 text-xs font-bold tracking-[0.12em] uppercase">Blog</span>
      </div>

      <h1 className="text-ink-950 mb-2 text-3xl font-black tracking-tight sm:text-4xl">
        {frontmatter.title}
      </h1>

      <div className="border-surface-200 text-ink-600 mb-8 flex items-center gap-2.5 border-b pb-6 text-sm">
        <span>{frontmatter.date}</span>
        <span className="bg-ink-600/40 h-[3px] w-[3px] rounded-full" />
        <span>{frontmatter.readingTime} min read</span>
      </div>

      <div className={proseClassName}>
        <MDXRemote source={content} components={mdxComponents} options={mdxOptions} />
      </div>

      {frontmatter.tags && (
        <div className="border-surface-200 mt-10 flex flex-wrap gap-1.5 border-t pt-6">
          {frontmatter.tags.map((tag: string) => (
            <span
              key={tag}
              className="border-surface-200 bg-surface-0 text-ink-950 rounded-full border px-3 py-0.5 text-xs font-bold"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  )
}
