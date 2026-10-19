import { unstable_cache } from 'next/cache'
import { and, asc, eq } from 'drizzle-orm'
import { getDb } from '@/lib/db/client'
import { reviewComments, type ReviewPersona } from '@/lib/db/schema'
import { CACHE_TAGS, cacheKey } from '@/lib/cache-tags'

export type ReviewCommentRow = typeof reviewComments.$inferSelect

export const PERSONA_LABELS: Record<
  ReviewPersona,
  { tab: string; title: string; description: string }
> = {
  boss: {
    tab: '上司の目線',
    title: '上司の目線',
    description: '継続・姿勢・人柄を\n読んでコメント',
  },
  tech: {
    tab: '技術の目線',
    title: 'テックリードの目線',
    description: '技術選定・理解の深さ・\n設計意図を読んでコメント',
  },
  peer: {
    tab: '同僚の目線',
    title: '同僚の目線',
    description: '一緒に働く立場から\n読んでコメント',
  },
  hr: {
    tab: '採用担当の目線',
    title: '採用担当の目線',
    description: '経歴と伸びしろを\n読んでコメント',
  },
}

export async function readPublishedReview() {
  const rows = await getDb()
    .select()
    .from(reviewComments)
    .where(and(eq(reviewComments.published, true)))
    .orderBy(asc(reviewComments.persona), asc(reviewComments.sort), asc(reviewComments.id))
  const updatedAt = rows.reduce<string | null>(
    (max, r) => (r.publishedAt && (!max || r.publishedAt > max) ? r.publishedAt : max),
    null
  )
  return { comments: rows, updatedAt }
}

export const getPublishedReview = unstable_cache(
  readPublishedReview,
  cacheKey('review-published'),
  {
    tags: [CACHE_TAGS.review],
  }
)

/** 根拠リンクはサイト内のパスかページ内アンカー、https のみ許可する */
export function safeEvidenceHref(href: string): string | null {
  if (/^\/(?!\/)/.test(href) || href.startsWith('#')) return href
  if (/^https:\/\//.test(href)) return href
  return null
}
