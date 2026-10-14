import Link from 'next/link'
import DeleteEntryButton from '@/components/admin/DeleteEntryButton'
import {
  PageHeader,
  StatusPill,
  btnGhost,
  btnPrimary,
  cardClass,
  inputClass,
} from '@/components/admin/ui'
import Tag from '@/components/ui/Tag'
import { listEntries } from '@/lib/admin/learning'
import { ENTRY_STATUSES, type EntryStatus } from '@/lib/db/schema'
import { formatMonthDay } from '@/lib/learning/date'

type Props = { searchParams: Promise<{ q?: string; status?: string; page?: string }> }

const STATUS_OPTIONS: { value: EntryStatus | ''; label: string }[] = [
  { value: '', label: 'すべて' },
  { value: 'published', label: '公開' },
  { value: 'draft', label: '下書き' },
  { value: 'private', label: '非公開' },
]

export default async function EntriesPage({ searchParams }: Props) {
  const params = await searchParams
  const q = (params.q ?? '').slice(0, 100)
  const status = ENTRY_STATUSES.includes(params.status as EntryStatus)
    ? (params.status as EntryStatus)
    : undefined
  const page = Math.max(1, Number(params.page) || 1)
  const { rows, total, pageCount } = await listEntries({ q, status, page })

  const href = (patch: Record<string, string | number | undefined>) => {
    const sp = new URLSearchParams()
    const merged = { q, status, page, ...patch }
    for (const [k, v] of Object.entries(merged))
      if (v && !(k === 'page' && v === 1)) sp.set(k, String(v))
    const s = sp.toString()
    return `/admin/learning${s ? `?${s}` : ''}`
  }

  return (
    <>
      <PageHeader
        eyebrow="Entries"
        title="記録一覧"
        description="学習の記録を検索・編集・公開管理します。"
        action={
          <Link href="/admin/learning/new" className={btnPrimary}>
            ＋ 記録する
          </Link>
        }
      />
      <div className="mb-5 flex flex-wrap items-center gap-4">
        <form action="/admin/learning" className="w-full max-w-[360px]" role="search">
          {status ? <input type="hidden" name="status" value={status} /> : null}
          <label htmlFor="entries-q" className="sr-only">
            メモ・タイトル・タグで検索
          </label>
          <input
            id="entries-q"
            name="q"
            defaultValue={q}
            placeholder="メモ・タイトル・タグで検索"
            className={`${inputClass} py-3 text-sm`}
          />
        </form>
        <nav
          aria-label="状態で絞り込み"
          className="bg-surface-200 inline-flex gap-1 rounded-xl p-1"
        >
          {STATUS_OPTIONS.map((o) => {
            const active = (status ?? '') === o.value
            return (
              <Link
                key={o.value}
                href={href({ status: o.value || undefined, page: 1 })}
                aria-current={active ? 'page' : undefined}
                className={`rounded-[9px] px-4 py-2 text-[13px] font-bold ${active ? 'bg-surface-950 text-ink-inverse-50' : 'text-ink-950'}`}
              >
                {o.label}
              </Link>
            )
          })}
        </nav>
        <span className="text-ink-600 ml-auto text-[13px] font-bold">{total} 件</span>
      </div>

      <div className={`${cardClass} overflow-x-auto px-2 pt-2 pb-3`}>
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="text-ink-600 text-[11px] font-black tracking-[0.08em]">
              <th scope="col" className="w-20 px-6 py-3.5">
                日付
              </th>
              <th scope="col" className="px-2 py-3.5">
                内容
              </th>
              <th scope="col" className="w-16 px-2 py-3.5 text-right">
                時間
              </th>
              <th scope="col" className="w-24 px-2 py-3.5">
                AI整形
              </th>
              <th scope="col" className="w-24 px-2 py-3.5">
                状態
              </th>
              <th scope="col" className="w-32 px-6 py-3.5 text-right">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-ink-600 border-surface-200 border-t p-12 text-center text-sm"
                >
                  条件に合う記録がありません。
                </td>
              </tr>
            ) : null}
            {rows.map((r) => (
              <tr key={r.id} className="border-surface-200 hover:bg-brand-50/60 border-t">
                <td className="text-ink-950 px-6 py-4 text-sm font-black">
                  {formatMonthDay(r.date)}
                </td>
                <td className="px-2 py-4">
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <span className="text-ink-700 text-sm leading-[1.6]">
                      {r.title || r.memo || '（タイトルなし）'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {r.tags.map((t) => (
                        <Tag key={t}>{t}</Tag>
                      ))}
                    </div>
                  </div>
                </td>
                <td className="text-brand-700 px-2 py-4 text-right text-sm font-black">
                  {r.minutes}分
                </td>
                <td className="text-ink-600 px-2 py-4 text-xs font-bold">
                  {r.reportAiPolished ? 'AI整形' : '手書き'}
                </td>
                <td className="px-2 py-4">
                  <StatusPill status={r.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-3.5 text-[13px] font-bold">
                    <Link href={`/admin/learning/${r.id}`} className="text-brand-500">
                      編集
                    </Link>
                    <DeleteEntryButton
                      id={r.id}
                      label={`${r.date.replaceAll('-', '/')}　${r.title || r.memo}`}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <nav
        aria-label="ページ送り"
        className="text-ink-600 mt-[18px] flex items-center justify-between text-[13px]"
      >
        <span>
          {Math.min(page, pageCount)} / {pageCount} ページ
        </span>
        <div className="flex gap-2">
          {page > 1 ? (
            <Link href={href({ page: page - 1 })} className={btnGhost}>
              ← 前へ
            </Link>
          ) : (
            <span className={`${btnGhost} opacity-50`} aria-disabled="true">
              ← 前へ
            </span>
          )}
          {page < pageCount ? (
            <Link href={href({ page: page + 1 })} className={btnGhost}>
              次へ →
            </Link>
          ) : (
            <span className={`${btnGhost} opacity-50`} aria-disabled="true">
              次へ →
            </span>
          )}
        </div>
      </nav>
    </>
  )
}
