'use server'

import { and, eq, ne } from 'drizzle-orm'
import { updateTag } from 'next/cache'
import { z } from 'zod'
import { ActionError, ownerAction } from '@/lib/admin/action'
import { postInputSchema } from '@/lib/admin/post-schema'
import { getDb } from '@/lib/db/client'
import { posts } from '@/lib/db/schema'
import { CACHE_TAGS } from '@/lib/cache-tags'
import { getAllNoteSlugs, getAllPostSlugs, getAllProjectSlugs } from '@/lib/content'

const MDX_SLUGS = {
  blog: getAllPostSlugs,
  'css-note': getAllNoteSlugs,
  project: getAllProjectSlugs,
} as const

export const savePost = ownerAction(postInputSchema, async (input) => {
  // 既存の MDX 記事と URL が重ならないようにする
  if (MDX_SLUGS[input.kind]().includes(input.slug)) {
    throw new ActionError('このスラッグは既存の MDX 記事で使われています。')
  }
  const db = getDb()
  const conflict = await db
    .select({ id: posts.id })
    .from(posts)
    .where(
      and(
        eq(posts.kind, input.kind),
        eq(posts.slug, input.slug),
        input.id ? ne(posts.id, input.id) : undefined
      )
    )
  if (conflict.length) throw new ActionError('このスラッグはすでに使われています。')

  const { id, intent, ...rest } = input
  const values = {
    ...rest,
    status: intent === 'publish' ? ('published' as const) : ('draft' as const),
  }
  let savedId: number
  if (id) {
    const [current] = await db
      .select({ publishedAt: posts.publishedAt })
      .from(posts)
      .where(eq(posts.id, id))
    if (!current) throw new ActionError('記事が見つかりませんでした。')
    await db
      .update(posts)
      .set({
        ...values,
        publishedAt:
          intent === 'publish'
            ? (current.publishedAt ?? new Date().toISOString())
            : current.publishedAt,
      })
      .where(eq(posts.id, id))
    savedId = id
  } else {
    const [row] = await db
      .insert(posts)
      .values({ ...values, publishedAt: intent === 'publish' ? new Date().toISOString() : null })
      .returning({ id: posts.id })
    savedId = row.id
  }
  updateTag(CACHE_TAGS.posts)
  return { id: savedId, status: values.status }
})

export const setPostStatus = ownerAction(
  z.object({ id: z.number().int().positive(), status: z.enum(['draft', 'published']) }),
  async ({ id, status }) => {
    const db = getDb()
    const [current] = await db
      .select({ publishedAt: posts.publishedAt })
      .from(posts)
      .where(eq(posts.id, id))
    if (!current) throw new ActionError('記事が見つかりませんでした。')
    await db
      .update(posts)
      .set({
        status,
        publishedAt:
          status === 'published'
            ? (current.publishedAt ?? new Date().toISOString())
            : current.publishedAt,
      })
      .where(eq(posts.id, id))
    updateTag(CACHE_TAGS.posts)
    return null
  }
)

export const deletePost = ownerAction(
  z.object({ id: z.number().int().positive() }),
  async ({ id }) => {
    await getDb().delete(posts).where(eq(posts.id, id))
    updateTag(CACHE_TAGS.posts)
    return null
  }
)
