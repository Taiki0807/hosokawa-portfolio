import Link from 'next/link'
import Tag from '@/components/ui/Tag'
import AiBadge from './AiBadge'
import { formatDateJa } from '@/lib/learning/date'
import type { PublicEntry } from '@/lib/learning/queries'

type Props = {
  date: string
  entry: PublicEntry | undefined
  privateMinutes: number | undefined
  showNotes: boolean
}

export default function DayDetail({ date, entry, privateMinutes, showNotes }: Props) {
  const minutes = entry?.minutes ?? privateMinutes
  return (
    <section
      aria-live="polite"
      aria-label="選択した日の記録"
      className="bg-surface-0 border-surface-200 flex flex-col gap-[22px] rounded-3xl border p-6 shadow-[var(--shadow-float)] sm:p-8"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-brand-500 mb-2 text-xs font-bold tracking-[0.12em] uppercase">
            Day detail
          </div>
          <h3 className="text-ink-950 text-[22px] leading-[1.3] font-black">
            {formatDateJa(date)}
          </h3>
        </div>
        {minutes ? (
          <div className="bg-surface-950 flex-none rounded-2xl px-4 py-2.5 text-center">
            <div className="text-[26px] leading-none font-black text-lime-500">{minutes}</div>
            <div className="text-ink-inverse-400 mt-1 text-[10px] font-bold">分</div>
          </div>
        ) : null}
      </div>

      {entry ? (
        <>
          <div className="flex flex-col gap-3.5">
            {entry.sessions.map((s, i) => (
              <div
                key={i}
                className="border-brand-500 flex items-start gap-3.5 border-l-4 py-0.5 pl-4"
              >
                <div className="flex flex-1 flex-col gap-1.5">
                  <div>
                    <Tag>{s.tag}</Tag>
                  </div>
                  {s.memo ? <p className="text-ink-700 text-sm leading-[1.7]">{s.memo}</p> : null}
                </div>
                <div className="text-brand-700 flex-none text-[13px] font-black">{s.minutes}分</div>
              </div>
            ))}
          </div>
          {entry.reportText ? (
            <div className="bg-surface-50 flex flex-col gap-2.5 rounded-2xl px-[22px] py-5">
              <div className="flex items-center justify-between">
                <span className="text-ink-950 text-xs font-black">学習レポート</span>
                {entry.reportAiPolished ? <AiBadge /> : null}
              </div>
              <p className="text-ink-700 text-sm leading-[1.95] whitespace-pre-line">
                {entry.reportText}
              </p>
            </div>
          ) : null}
          {showNotes && entry.hasNote ? (
            <Link
              href={`/learning/${entry.date}`}
              className="text-brand-500 inline-flex w-fit items-center gap-1.5 text-[13px] font-bold hover:underline"
            >
              詳細ノートを読む →
            </Link>
          ) : null}
          <p className="text-ink-600 text-[11px] leading-[1.8]">
            時間・タグ・メモは本人が入力した記録です。
            {entry.reportAiPolished ? 'レポートの文章のみAIが整えています。' : null}
          </p>
        </>
      ) : (
        <div className="bg-surface-50 text-ink-600 rounded-2xl px-6 py-7 text-center text-sm leading-[1.8]">
          {privateMinutes
            ? `この日の記録は非公開です（学習時間 ${privateMinutes}分）。`
            : 'この日の記録はありません。'}
        </div>
      )}
    </section>
  )
}
