import { redirect } from 'next/navigation'
import LearningForm from '@/components/admin/LearningForm'
import { newFormValues } from '@/components/admin/learning-form-values'
import { PageHeader } from '@/components/admin/ui'
import { getEntryIdByDate, getTagSuggestions } from '@/lib/admin/learning'
import { isIsoDate, todayJst } from '@/lib/learning/date'
import { readSettings } from '@/lib/settings'
import { SUGGESTED_TAGS } from '@/config/learning-domains'

// AI 整形（Server Action）の実行時間
export const maxDuration = 60

type Props = { searchParams: Promise<{ date?: string }> }

export default async function NewLearningPage({ searchParams }: Props) {
  const { date: qDate } = await searchParams
  const today = todayJst()
  const requested = qDate && isIsoDate(qDate) && qDate <= today ? qDate : null
  const date = requested ?? today
  const existing = await getEntryIdByDate(date)
  // 日付を指定して開いたときだけ、その日の記録の編集へ移る。
  // 指定がなければ今日の記録があってもこの画面のままにし、ほかの日を選べるようにする
  if (existing && requested) redirect(`/admin/learning/${existing}`)

  const [settings, tags] = await Promise.all([readSettings(), getTagSuggestions(SUGGESTED_TAGS)])
  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="記録を書く"
        description="日付は過去の日も選べます。時間・タグ・一言メモは自分で入力します。AIは入力内容を読みやすい日報の文章に整えるだけで、事実は足しません。"
      />
      <LearningForm
        initial={newFormValues(date)}
        tagSuggestions={tags}
        aiEnabled={settings.ai.enabled}
        publishOnSave={settings.publish.publishOnSave}
        showNotes={settings.publish.showNotes}
        today={today}
        initialConflictId={existing}
      />
    </>
  )
}
