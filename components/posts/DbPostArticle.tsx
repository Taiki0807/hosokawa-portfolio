import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import NoteMarkdown from '@/components/learning/NoteMarkdown'
import { isAllowedLinkHref } from '@/lib/admin/post-schema'
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

      <div
        className={`border-surface-200 text-ink-600 flex items-center gap-2.5 border-b pb-6 text-sm ${post.linkHref ? 'mb-6' : 'mb-8'}`}
      >
        <span>{publishedDateOf(post)}</span>
        <span className="bg-ink-600/40 h-[3px] w-[3px] rounded-full" />
        <span>{readingTimeOf(post.bodyMd)} min read</span>
      </div>

      {post.linkHref && isAllowedLinkHref(post.linkHref) ? (
        <div className="mb-8 flex justify-end">
          <a
            href={post.linkHref}
            {...(post.linkHref.startsWith('/')
              ? {}
              : { target: '_blank', rel: 'noopener noreferrer' })}
            className="text-ink-950 inline-flex items-center gap-1.5 rounded-full bg-lime-500 px-5 py-2 text-[13px] font-bold tracking-[0.06em] uppercase"
          >
            {post.linkLabel || 'サイトを見る'}
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      ) : null}

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
