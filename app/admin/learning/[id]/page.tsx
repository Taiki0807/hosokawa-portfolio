import { notFound } from 'next/navigation'
import Link from 'next/link'
import LearningForm from '@/components/admin/LearningForm'
import { PageHeader } from '@/components/admin/ui'
import { getEntry, getTagSuggestions } from '@/lib/admin/learning'
import { readSettings } from '@/lib/settings'
import { formatDateJa, todayJst } from '@/lib/learning/date'
import { SUGGESTED_TAGS } from '@/config/learning-domains'

export const maxDuration = 60

type Props = { params: Promise<{ id: string }> }

export default async function EditLearningPage({ params }: Props) {
  const id = Number((await params).id)
  if (!Number.isInteger(id) || id <= 0) notFound()
  const [entry, settings, tags] = await Promise.all([
    getEntry(id),
    readSettings(),
    getTagSuggestions(SUGGESTED_TAGS),
  ])
  if (!entry) notFound()

  return (
    <>
      <Link
        href="/admin/learning"
        className="text-brand-500 mb-4 inline-flex text-[13px] font-bold"
      >
        ← 記録一覧に戻る
      </Link>
      <PageHeader eyebrow="Edit" title={`${formatDateJa(entry.date)}の記録`} />
      <LearningForm
        key={entry.updatedAt}
        initial={{
          id: entry.id,
          date: entry.date,
          title: entry.title,
          status: entry.status,
          sessions: entry.sessions.map((s) => ({
            tag: s.tag,
            minutes: String(s.minutes),
            memo: s.memo,
          })),
          noteMd: entry.noteMd,
          reportText: entry.reportText,
          reportAiPolished: entry.reportAiPolished,
        }}
        tagSuggestions={tags}
        aiEnabled={settings.ai.enabled}
        publishOnSave={settings.publish.publishOnSave}
        showNotes={settings.publish.showNotes}
        today={todayJst()}
      />
    </>
  )
}
