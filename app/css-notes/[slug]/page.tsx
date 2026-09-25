import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { ArrowLeft } from 'lucide-react'
import { getNoteBySlug, getAllNoteSlugs } from '@/lib/content'
import { Callout } from '@/components/ui/Callout'
import { CodePreview } from '@/components/ui/CodePreview'
import { proseClassName } from '@/components/ui/prose'
import { mdxOptions } from '@/lib/mdx'

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
      <Link
        href="/css-notes"
        className="text-brand-500 mb-5 inline-flex items-center gap-1.5 text-[13px] font-bold"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        CSS Notes
      </Link>

      <div className="mb-4 flex items-center gap-2.5">
        <span className="text-brand-500 text-xs font-bold tracking-[0.12em] uppercase">
          CSS Notes
        </span>
        <span className="bg-ink-600/40 h-[3px] w-[3px] rounded-full" />
        <span className="text-ink-600 text-xs font-bold">{frontmatter.category}</span>
      </div>

      <h1 className="text-ink-950 mb-2 font-mono text-3xl font-black tracking-tight sm:text-4xl">
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
    </article>
  )
}
