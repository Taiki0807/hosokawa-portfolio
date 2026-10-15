import { notFound } from 'next/navigation'
import { eq } from 'drizzle-orm'
import PostEditor from '@/components/admin/PostEditor'
import { PageHeader } from '@/components/admin/ui'
import { getDb } from '@/lib/db/client'
import { posts } from '@/lib/db/schema'

type Props = { params: Promise<{ id: string }> }

export default async function EditPostPage({ params }: Props) {
  const id = Number((await params).id)
  if (!Number.isInteger(id) || id <= 0) notFound()
  const [p] = await getDb().select().from(posts).where(eq(posts.id, id))
  if (!p) notFound()
  return (
    <>
      <PageHeader eyebrow="Editor" title="記事を編集" />
      <PostEditor
        key={p.updatedAt}
        initial={{
          id: p.id,
          kind: p.kind,
          slug: p.slug,
          title: p.title,
          category: p.category,
          excerpt: p.excerpt,
          tags: p.tags.join(', '),
          bodyMd: p.bodyMd,
          linkLabel: p.linkLabel,
          linkHref: p.linkHref,
          icon: p.icon,
          status: p.status,
        }}
      />
    </>
  )
}
