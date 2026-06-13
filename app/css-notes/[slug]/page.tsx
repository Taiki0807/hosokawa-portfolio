import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getNoteBySlug, getAllNoteSlugs } from '@/lib/content'
import { Callout } from '@/components/ui/Callout'
import { CodePreview } from '@/components/ui/CodePreview'

// MDX内で使えるコンポーネントを登録
const mdxComponents = {
  Callout,
  CodePreview,
}

// 静的生成（ビルド時に全記事ページを生成）
export function generateStaticParams() {
  return getAllNoteSlugs().map((slug) => ({ slug }))
}

type Props = {
  params: Promise<{ slug: string }>
}

export default async function NotePage({ params }: Props) {
  const { slug } = await params

  let note
  try {
    note = getNoteBySlug(slug)
  } catch {
    notFound()
  }

  const { frontmatter, content } = note

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
    </article>
  )
}
