import { unstable_cache } from 'next/cache'
import { and, desc, eq } from 'drizzle-orm'
import { getDb } from '@/lib/db/client'
import { posts, type PostKind } from '@/lib/db/schema'
import { CACHE_TAGS } from '@/lib/cache-tags'
import { toJstDate } from '@/lib/learning/date'
import {
  getAllNotes,
  getAllPosts,
  getAllProjects,
  type NoteMeta,
  type PostMeta,
  type ProjectMeta,
} from '@/lib/content'

// 管理画面から書いた記事（D1）を、既存の MDX 記事と並べて表示するための取得関数
// slug が重なったときは MDX を優先する（既存の URL・記事を変えない）

export type DbPost = typeof posts.$inferSelect

export function readingTimeOf(markdown: string) {
  return Math.max(1, Math.ceil(markdown.length / 500))
}

export function publishedDateOf(post: Pick<DbPost, 'publishedAt' | 'createdAt'>) {
  return toJstDate(new Date(post.publishedAt ?? post.createdAt))
}

async function readPublishedPosts(kind: PostKind) {
  return getDb()
    .select()
    .from(posts)
    .where(and(eq(posts.kind, kind), eq(posts.status, 'published')))
    .orderBy(desc(posts.publishedAt))
}

export const getPublishedDbPosts = unstable_cache(readPublishedPosts, ['posts-published'], {
  tags: [CACHE_TAGS.posts],
})

async function readPublishedPost(kind: PostKind, slug: string) {
  const [row] = await getDb()
    .select()
    .from(posts)
    .where(and(eq(posts.kind, kind), eq(posts.slug, slug), eq(posts.status, 'published')))
  return row ?? null
}

export const getPublishedDbPost = unstable_cache(readPublishedPost, ['post-published'], {
  tags: [CACHE_TAGS.posts],
})

function byDateDesc<T extends { date: string }>(a: T, b: T) {
  return a.date > b.date ? -1 : 1
}

export async function getMergedPosts(): Promise<PostMeta[]> {
  const mdx = getAllPosts()
  const taken = new Set(mdx.map((p) => p.slug))
  const db = (await getPublishedDbPosts('blog'))
    .filter((p) => !taken.has(p.slug))
    .map<PostMeta>((p) => ({
      slug: p.slug,
      title: p.title,
      category: p.category,
      date: publishedDateOf(p),
      readingTime: readingTimeOf(p.bodyMd),
      excerpt: p.excerpt || undefined,
      tags: p.tags.length ? p.tags : undefined,
    }))
  return [...mdx, ...db].sort(byDateDesc)
}

export async function getMergedNotes(): Promise<NoteMeta[]> {
  const mdx = getAllNotes()
  const taken = new Set(mdx.map((p) => p.slug))
  const db = (await getPublishedDbPosts('css-note'))
    .filter((p) => !taken.has(p.slug))
    .map<NoteMeta>((p) => ({
      slug: p.slug,
      title: p.title,
      category: p.category,
      date: publishedDateOf(p),
      readingTime: readingTimeOf(p.bodyMd),
    }))
  return [...mdx, ...db].sort(byDateDesc)
}

export async function getMergedProjects(): Promise<ProjectMeta[]> {
  const mdx = getAllProjects()
  const taken = new Set(mdx.map((p) => p.slug))
  const db = (await getPublishedDbPosts('project'))
    .filter((p) => !taken.has(p.slug))
    .map<ProjectMeta>((p) => ({
      slug: p.slug,
      title: p.title,
      description: p.excerpt,
      date: publishedDateOf(p),
      readingTime: readingTimeOf(p.bodyMd),
      tags: p.tags,
    }))
  return [...mdx, ...db].sort(byDateDesc)
}
