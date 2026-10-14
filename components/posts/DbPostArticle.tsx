import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import NoteMarkdown from '@/components/learning/NoteMarkdown'
import { publishedDateOf, readingTimeOf, type DbPost } from '@/lib/posts'

type Props = { post: DbPost; backHref: string; backLabel: string; eyebrow: string }

/** 管理画面から書いた記事（サニタイズ済み Markdown）を、MDX 記事と同じレイアウトで表示する */
export default function DbPostArticle({ post, backHref, backLabel, eyebrow }: Props) {
  return (
    <article>
      <Link
        href={backHref}
        className="text-brand-500 mb-5 inline-flex items-center gap-1.5 text-[13px] font-bold"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {backLabel}
      </Link>

      <div className="mb-4 flex items-center gap-2">
        <span className="text-brand-500 text-xs font-bold tracking-[0.12em] uppercase">
          {eyebrow}
        </span>
      </div>

      <h1 className="text-ink-950 mb-2 text-3xl font-black tracking-tight sm:text-4xl">
        {post.title}
      </h1>

      <div className="border-surface-200 text-ink-600 mb-8 flex items-center gap-2.5 border-b pb-6 text-sm">
        <span>{publishedDateOf(post)}</span>
        <span className="bg-ink-600/40 h-[3px] w-[3px] rounded-full" />
        <span>{readingTimeOf(post.bodyMd)} min read</span>
      </div>

      <NoteMarkdown markdown={post.bodyMd} />

      {post.tags.length > 0 && (
        <div className="border-surface-200 mt-10 flex flex-wrap gap-1.5 border-t pt-6">
          {post.tags.map((tag) => (
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
