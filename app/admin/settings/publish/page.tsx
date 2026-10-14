import PublishSettingsForm from '@/components/admin/PublishSettingsForm'
import { PageHeader } from '@/components/admin/ui'
import { readSettings } from '@/lib/settings'

export default async function PublishSettingsPage() {
  const settings = await readSettings()
  return (
    <>
      <PageHeader
        eyebrow="Publishing & AI"
        title="公開とAIの設定"
        description="何を公開するか、AIをどこまで使うかを決めます。"
      />
      <PublishSettingsForm initial={settings} />
    </>
  )
}
