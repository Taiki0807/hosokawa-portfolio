import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getPostBySlug, getAllPostSlugs } from '@/lib/content'
import { Callout } from '@/components/ui/Callout'
import { CodePreview } from '@/components/ui/CodePreview'

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
      <span className="mb-4 inline-block rounded-full border border-purple-200 bg-purple-50 px-3 py-1 font-mono text-xs font-bold text-purple-600">
        {frontmatter.category}
      </span>

      <h1 className="mb-2 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
        {frontmatter.title}
      </h1>

      <div className="mb-8 border-b border-purple-100 pb-6 font-mono text-sm text-gray-400">
        {frontmatter.date} · {frontmatter.readingTime} min read
      </div>

      <div className="prose">
        <MDXRemote source={content} components={mdxComponents} />
      </div>

      {frontmatter.tags && (
        <div className="mt-10 flex flex-wrap gap-1.5 border-t border-purple-100 pt-6">
          {frontmatter.tags.map((tag: string) => (
            <span
              key={tag}
              className="rounded-full bg-gray-100 px-2.5 py-0.5 font-mono text-xs text-gray-500"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  )
}
