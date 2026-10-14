import PostEditor from '@/components/admin/PostEditor'
import { PageHeader } from '@/components/admin/ui'
import { POST_KINDS, type PostKind } from '@/lib/db/schema'

type Props = { searchParams: Promise<{ kind?: string }> }

export default async function NewPostPage({ searchParams }: Props) {
  const k = (await searchParams).kind
  const kind: PostKind = POST_KINDS.includes(k as PostKind) ? (k as PostKind) : 'blog'
  return (
    <>
      <PageHeader eyebrow="Editor" title="新規作成" />
      <PostEditor
        initial={{
          kind,
          slug: '',
          title: '',
          category: '',
          excerpt: '',
          tags: '',
          bodyMd: '',
          status: 'draft',
        }}
      />
    </>
  )
}
