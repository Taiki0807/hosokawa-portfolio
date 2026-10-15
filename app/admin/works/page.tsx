import Link from 'next/link'
import { desc, eq } from 'drizzle-orm'
import PostRowActions from '@/components/admin/PostRowActions'
import { PageHeader, StatusPill, btnGhost, btnPrimary, cardClass } from '@/components/admin/ui'
import { getDb } from '@/lib/db/client'
import { posts, POST_KINDS, type PostKind } from '@/lib/db/schema'
import { getAllNotes, getAllPosts, getAllProjects } from '@/lib/content'
import { toJstDate } from '@/lib/learning/date'

const TABS: { value: PostKind; label: string; base: string; dir: string }[] = [
  { value: 'project', label: '成果物', base: '/projects', dir: 'projects' },
  { value: 'blog', label: 'ブログ', base: '/blog', dir: 'blog' },
  { value: 'css-note', label: 'CSSノート', base: '/css-notes', dir: 'css-notes' },
]
const REPO = 'https://github.com/Taiki0807/hosokawa-portfolio/blob/main/content'

type Props = { searchParams: Promise<{ kind?: string }> }

export default async function WorksPage({ searchParams }: Props) {
  const kindParam = (await searchParams).kind
  const kind: PostKind = POST_KINDS.includes(kindParam as PostKind)
    ? (kindParam as PostKind)
    : 'project'
  const tab = TABS.find((t) => t.value === kind)!
  const dbPosts = await getDb()
    .select()
    .from(posts)
    .where(eq(posts.kind, kind))
    .orderBy(desc(posts.updatedAt))
  const mdx = (
    kind === 'blog' ? getAllPosts() : kind === 'css-note' ? getAllNotes() : getAllProjects()
  ).map((m) => ({
    slug: m.slug,
    title: m.title,
    date: m.date,
    desc: String(
      'excerpt' in m ? (m.excerpt ?? '') : 'description' in m ? m.description : m.category
    ),
  }))

  return (
    <>
      <PageHeader
        eyebrow="Content"
        title="成果物・ブログ"
        description="公開している成果物・ブログ記事・CSSノートを管理します。"
        action={
          <Link href={`/admin/works/new?kind=${kind}`} className={btnPrimary}>
            ＋ 新規作成
          </Link>
        }
      />
      <nav aria-label="種類" className="bg-surface-200 mb-5 inline-flex gap-1 rounded-xl p-1">
        {TABS.map((t) => (
          <Link
            key={t.value}
            href={`/admin/works?kind=${t.value}`}
            aria-current={t.value === kind ? 'page' : undefined}
            className={`rounded-[9px] px-4 py-2 text-[13px] font-bold ${t.value === kind ? 'bg-surface-950 text-ink-inverse-50' : 'text-ink-950'}`}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      <ul className="flex flex-col gap-3">
        {dbPosts.map((p) => (
          <li key={p.id} className={`${cardClass} flex flex-wrap items-center gap-4 px-6 py-5`}>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-ink-950 text-base font-black">{p.title}</span>
                <StatusPill status={p.status} />
              </div>
              {p.excerpt ? <span className="text-ink-700 text-sm">{p.excerpt}</span> : null}
              <span className="text-ink-600 text-xs">
                {tab.base}/{p.slug} ・ 更新 {toJstDate(new Date(p.updatedAt))}
              </span>
            </div>
            <div className="flex gap-2">
              <PostRowActions id={p.id} status={p.status} />
              <Link href={`/admin/works/${p.id}`} className={btnGhost}>
                編集
              </Link>
            </div>
          </li>
        ))}
        {mdx.map((m) => (
          <li key={m.slug} className={`${cardClass} flex flex-wrap items-center gap-4 px-6 py-5`}>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-ink-950 text-base font-black">{m.title}</span>
                <span className="bg-surface-200 text-ink-700 rounded-full px-[11px] py-1 text-[11px] font-black">
                  MDX
                </span>
              </div>
              {m.desc ? <span className="text-ink-700 text-sm">{m.desc}</span> : null}
              <span className="text-ink-600 text-xs">
                {tab.base}/{m.slug} ・ {m.date}
              </span>
            </div>
            <a
              href={`${REPO}/${tab.dir}/${m.slug}.mdx`}
              target="_blank"
              rel="noopener noreferrer"
              className={btnGhost}
            >
              リポジトリで編集 ↗
            </a>
          </li>
        ))}
        {dbPosts.length + mdx.length === 0 ? (
          <li className="text-ink-600 p-10 text-center text-sm">まだありません。</li>
        ) : null}
      </ul>
      <p className="text-ink-600 mt-5 text-xs leading-[1.8]">
        管理画面で書く記事は Markdown（サニタイズして表示）です。既存の MDX
        記事はリポジトリで編集し、あとで管理画面へ移行します。
      </p>
    </>
  )
}
