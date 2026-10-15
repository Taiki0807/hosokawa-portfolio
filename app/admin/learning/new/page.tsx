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
  const date = qDate && isIsoDate(qDate) ? qDate : todayJst()
  // その日の記録がすでにあれば編集画面へ
  const existing = await getEntryIdByDate(date)
  if (existing) redirect(`/admin/learning/${existing}`)

  const [settings, tags] = await Promise.all([readSettings(), getTagSuggestions(SUGGESTED_TAGS)])
  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="今日の記録を書く"
        description="時間・タグ・一言メモは自分で入力します。AIは入力内容を読みやすい日報の文章に整えるだけで、事実は足しません。"
      />
      <LearningForm
        initial={newFormValues(date)}
        tagSuggestions={tags}
        aiEnabled={settings.ai.enabled}
        publishOnSave={settings.publish.publishOnSave}
        showNotes={settings.publish.showNotes}
      />
    </>
  )
}
