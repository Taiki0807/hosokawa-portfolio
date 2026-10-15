import Link from 'next/link'
import { desc, eq } from 'drizzle-orm'
import InquiryActions from '@/components/admin/InquiryActions'
import { PageHeader, btnPrimary, cardClass } from '@/components/admin/ui'
import { getDb } from '@/lib/db/client'
import { contactMessages } from '@/lib/db/schema'
import { toJstDate } from '@/lib/learning/date'

type Filter = 'open' | 'done' | 'spam' | 'all'
type Props = { searchParams: Promise<{ filter?: string; id?: string }> }

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'open', label: '未対応' },
  { value: 'done', label: '対応済み' },
  { value: 'spam', label: '迷惑メール' },
  { value: 'all', label: 'すべて' },
]

function formatDateTime(iso: string) {
  const d = new Date(iso)
  const date = toJstDate(d)
  const time = new Date(d.getTime() + 9 * 3600_000).toISOString().slice(11, 16)
  return `${date.slice(5).replace('-', '/')} ${time}`
}

const STATUS_LABEL = {
  open: ['未対応', 'bg-lime-500 text-ink-950'],
  done: ['対応済み', 'bg-surface-200 text-ink-700'],
  spam: ['迷惑メール', 'bg-[#fde4e1] text-danger-600'],
} as const

export default async function InboxPage({ searchParams }: Props) {
  const params = await searchParams
  const filter = (FILTERS.some((f) => f.value === params.filter) ? params.filter : 'open') as Filter
  const db = getDb()
  const all = await db
    .select()
    .from(contactMessages)
    .orderBy(desc(contactMessages.createdAt))
    .limit(200)
  const list =
    filter === 'all'
      ? all.filter((m) => m.status !== 'spam')
      : all.filter((m) => m.status === filter)
  const openCount = all.filter((m) => m.status === 'open').length
  const selectedId = Number(params.id) || list[0]?.id
  const selected = selectedId
    ? (all.find((m) => m.id === selectedId) ??
      (await db.select().from(contactMessages).where(eq(contactMessages.id, selectedId)))[0])
    : undefined

  const href = (patch: { filter?: Filter; id?: number }) => {
    const sp = new URLSearchParams()
    const f = patch.filter ?? filter
    if (f !== 'open') sp.set('filter', f)
    if (patch.id) sp.set('id', String(patch.id))
    const s = sp.toString()
    return `/admin/inbox${s ? `?${s}` : ''}`
  }

  return (
    <>
      <PageHeader
        eyebrow="Inbox"
        title="お問い合わせ"
        description="サイトのフォームから届いたメッセージです。個人情報のため、この画面以外には表示しません。"
        action={
          <span className="text-ink-600 text-[13px] font-bold">
            未対応 <span className="text-ink-950 font-black">{openCount}</span> 件
          </span>
        }
      />
      <nav
        aria-label="状態で絞り込み"
        className="bg-surface-200 mb-[18px] inline-flex gap-1 rounded-xl p-1"
      >
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={href({ filter: f.value })}
            aria-current={filter === f.value ? 'page' : undefined}
            className={`rounded-[9px] px-4 py-2 text-[13px] font-bold ${filter === f.value ? 'bg-surface-950 text-ink-inverse-50' : 'text-ink-950'}`}
          >
            {f.label}
          </Link>
        ))}
      </nav>
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
        <ul className={`${cardClass} flex flex-col p-2 xl:w-[400px] xl:flex-none`}>
          {list.length === 0 ? (
            <li className="text-ink-600 p-10 text-center text-[13px]">
              該当するメッセージはありません。
            </li>
          ) : null}
          {list.map((m) => {
            const active = m.id === selected?.id
            return (
              <li key={m.id}>
                <Link
                  href={href({ id: m.id })}
                  aria-current={active ? 'true' : undefined}
                  className={`flex gap-3 rounded-2xl border-[1.5px] px-[18px] py-4 ${active ? 'border-brand-500 bg-white' : 'hover:bg-brand-50/60 border-transparent'}`}
                >
                  <span
                    aria-hidden="true"
                    className={`mt-1.5 h-2.5 w-2.5 flex-none rounded-full ${m.status === 'open' ? 'bg-brand-500' : 'bg-brand-200'}`}
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex justify-between gap-2">
                      <span className="text-ink-950 truncate text-sm font-black">{m.name}</span>
                      <span className="text-ink-600 text-[11px] whitespace-nowrap">
                        {formatDateTime(m.createdAt)}
                      </span>
                    </div>
                    <span className="text-ink-700 truncate text-[13px] font-bold">{m.subject}</span>
                    {m.mailStatus === 'failed' ? (
                      <span className="text-danger-600 text-[11px] font-bold">
                        通知メールの送信に失敗
                      </span>
                    ) : null}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
        <section
          className={`${cardClass} flex min-h-[420px] min-w-0 flex-1 flex-col gap-5 p-6 sm:p-8`}
        >
          {selected ? (
            <>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-ink-950 text-[22px] leading-[1.4] font-black break-words">
                    {selected.subject}
                  </h2>
                  <p className="text-ink-600 mt-1.5 text-[13px] break-all">
                    {selected.name} ＜{selected.email}＞ ・ {formatDateTime(selected.createdAt)}
                  </p>
                </div>
                <span
                  className={`flex-none rounded-full px-3 py-1 text-[11px] font-black ${STATUS_LABEL[selected.status][1]}`}
                >
                  {STATUS_LABEL[selected.status][0]}
                </span>
              </div>
              {selected.mailStatus === 'failed' ? (
                <p className="text-danger-600 rounded-xl bg-[#fde4e1] px-4 py-2.5 text-xs font-bold">
                  通知メールの送信に失敗しました（{selected.mailError ?? '原因不明'}
                  ）。メッセージは保存されています。
                </p>
              ) : null}
              <div className="bg-surface-200 h-px" />
              <p className="text-ink-700 text-[15px] leading-[2] break-words whitespace-pre-wrap">
                {selected.message}
              </p>
              <div className="mt-auto flex flex-wrap items-center gap-2.5">
                <a
                  className={btnPrimary}
                  href={`mailto:${encodeURIComponent(selected.email)}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}`}
                >
                  メールで返信
                </a>
                <InquiryActions id={selected.id} status={selected.status} />
              </div>
            </>
          ) : (
            <p className="text-ink-600 m-auto text-sm">左の一覧からメッセージを選んでください。</p>
          )}
        </section>
      </div>
    </>
  )
}
