import GoalsForm from '@/components/admin/GoalsForm'
import { PageHeader } from '@/components/admin/ui'
import { readGoalsData } from '@/lib/learning/queries'
import { monthOf, todayJst, yearOf } from '@/lib/learning/date'

const str = (v: number | null) => (v == null ? '' : String(v))

export default async function GoalsSettingsPage() {
  const { goals, certTargets } = await readGoalsData()
  const today = todayJst()
  return (
    <>
      <PageHeader
        eyebrow="Goals"
        title="目標と資格"
        description="ホームの「目標と挑戦中の資格」に表示される内容です。"
      />
      <GoalsForm
        year={yearOf(today)}
        month={monthOf(today)}
        initialCerts={certTargets.map((c) => ({
          name: c.name,
          issuer: c.issuer,
          examDate: c.examDate ?? '',
          progressMode: c.progressMode,
          manualProgress: str(c.manualProgress),
          studyTags: c.studyTags.join(', '),
          targetHours: str(c.targetHours),
          currentFocus: c.currentFocus,
          isNowStudying: c.isNowStudying,
        }))}
        initialGoals={goals.map((g) => ({
          kind: g.kind,
          period: g.period,
          label: g.label,
          target: String(g.target),
          unit: g.unit,
          source: g.source,
          manualValue: str(g.manualValue),
          studyTags: g.studyTags.join(', '),
          note: g.note,
        }))}
      />
    </>
  )
}
