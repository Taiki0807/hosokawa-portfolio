import Link from 'next/link'
import { PageHeader, StatusPill, btnPrimary, cardClass } from '@/components/admin/ui'
import { getOverview } from '@/lib/admin/learning'
import { requireOwnerPage } from '@/lib/auth/require-owner'
import { formatMonthDay, formatSlash } from '@/lib/learning/date'

export default async function AdminOverviewPage() {
  const owner = await requireOwnerPage()
  const o = await getOverview()
  const recordedToday = Boolean(o.todayEntry)

  const stats: [number, string, string][] = [
    [o.currentStreak, '日', '現在の連続記録'],
    [o.monthStudyDays, '日', '今月の学習日数'],
    [o.draftCount, '件', '下書き'],
    [o.publishedCount, '件', '公開中の記録'],
  ]

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title={`おかえりなさい、${owner.name ?? owner.login}`}
        description="今日の記録と、公開中のログの状況です。"
      />

      <div className="from-brand-700 via-brand-500 to-brand-400 relative flex flex-wrap items-center justify-between gap-6 overflow-hidden rounded-[28px] bg-linear-120 px-8 py-8 shadow-[0_40px_70px_-36px_rgba(52,44,122,0.7)] sm:px-10">
        <div className="flex flex-col gap-2">
          <span className="text-brand-200 text-xs font-bold tracking-[0.08em]">
            TODAY {formatSlash(o.today)}
          </span>
          <span className="text-ink-inverse-50 text-[22px] font-black sm:text-[26px]">
            {recordedToday ? '今日の学習は記録済みです' : '今日の学習は、まだ記録していません'}
          </span>
          <span className="text-brand-200 text-[13px]">
            連続記録 {o.currentStreak}日
            {recordedToday ? '' : ` ・ 今日記録すると ${o.currentStreak + 1}日に伸びます`}
          </span>
        </div>
        <Link
          href={recordedToday ? `/admin/learning/${o.todayEntry!.id}` : '/admin/learning/new'}
          className={`${btnPrimary} flex-none`}
        >
          {recordedToday ? '今日の記録を編集' : '記録する'}
        </Link>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
        {stats.map(([value, unit, label]) => (
          <div key={label} className={`${cardClass} px-6 py-[22px]`}>
            <dd className="text-ink-950 text-4xl leading-none font-black">
              {value}
              <span className="text-brand-500 ml-1 text-sm font-bold">{unit}</span>
            </dd>
            <dt className="text-ink-600 mt-2 text-xs font-bold">{label}</dt>
          </div>
        ))}
      </dl>

      <section className={`${cardClass} mt-6 px-6 pt-2 pb-4 sm:px-8`}>
        <div className="flex items-baseline justify-between pt-[22px] pb-3.5">
          <h2 className="text-ink-950 text-lg font-black">最近の記録</h2>
          <Link href="/admin/learning" className="text-ink-600 text-xs font-bold">
            すべて見る →
          </Link>
        </div>
        {o.recent.length === 0 ? (
          <p className="text-ink-600 border-surface-200 border-t py-6 text-sm">
            まだ記録がありません。
          </p>
        ) : null}
        <ul>
          {o.recent.map((e) => (
            <li
              key={e.id}
              className="border-surface-200 flex items-center gap-[18px] border-t py-4"
            >
              <span className="text-ink-950 w-14 flex-none text-sm font-black">
                {formatMonthDay(e.date)}
              </span>
              <span className="text-ink-700 min-w-0 flex-1 truncate text-sm">
                {e.title || '（タイトルなし）'}
              </span>
              <StatusPill status={e.status} />
              <Link
                href={`/admin/learning/${e.id}`}
                className="text-brand-500 text-[13px] font-bold"
              >
                編集
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
