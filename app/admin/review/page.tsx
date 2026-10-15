import ReviewWorkbench from '@/components/admin/ReviewWorkbench'
import { PageHeader, cardClass } from '@/components/admin/ui'
import { getReviewHistory, getReviewState } from '@/lib/admin/review'
import { REVIEW_PERSONAS, type ReviewPersona } from '@/lib/db/schema'
import { PERSONA_LABELS } from '@/lib/review/queries'
import { formatSlash, toJstDate } from '@/lib/learning/date'
import { readSettings } from '@/lib/settings'

// AI 呼び出し（Server Action）の実行時間
export const maxDuration = 60

type Props = { searchParams: Promise<{ persona?: string }> }

export default async function ReviewAdminPage({ searchParams }: Props) {
  const p = (await searchParams).persona
  const persona: ReviewPersona = REVIEW_PERSONAS.includes(p as ReviewPersona)
    ? (p as ReviewPersona)
    : 'boss'
  const [state, history, settings] = await Promise.all([
    getReviewState(persona),
    getReviewHistory(),
    readSettings(),
  ])
  const last = state.drafts[0]?.generatedAt
  return (
    <>
      <PageHeader
        eyebrow="AI Review"
        title="AIレビュー"
        description="学習・開発ログと成果物をAIに読ませて、第三者の目線のコメント案を作ります。内容を確認・編集してから、ホームに公開します。"
      />
      <ReviewWorkbench
        key={`${persona}-${state.drafts[0]?.batchId ?? 'none'}`}
        persona={persona}
        aiEnabled={settings.ai.enabled}
        lastGeneratedAt={last ? formatSlash(toJstDate(new Date(last))) : null}
        drafts={state.drafts.map((d) => ({
          id: d.id,
          tag: d.tag,
          title: d.title,
          text: d.text,
          evidence: d.evidence,
          published: d.published,
        }))}
      />
      <section className={`${cardClass} mt-6 p-6 xl:max-w-[380px]`}>
        <h2 className="text-ink-950 mb-3 text-sm font-black">生成の履歴</h2>
        {history.length === 0 ? <p className="text-ink-600 text-xs">まだありません。</p> : null}
        <ul>
          {history.map((h) => (
            <li
              key={h.batchId}
              className="border-surface-200 flex items-center justify-between border-t py-2.5 text-[13px]"
            >
              <span className="text-ink-700">
                {formatSlash(toJstDate(new Date(h.generatedAt)))} ・{' '}
                {PERSONA_LABELS[h.persona].tab.replace('の目線', '')}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-black ${h.published ? 'bg-brand-100 text-brand-700' : 'bg-surface-200 text-ink-700'}`}
              >
                {h.published ? '公開中' : '過去'}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
