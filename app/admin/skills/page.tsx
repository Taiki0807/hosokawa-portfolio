import SkillsForm from '@/components/admin/SkillsForm'
import { PageHeader } from '@/components/admin/ui'
import { readSkillsAndCertifications } from '@/lib/skills/queries'

export default async function SkillsAdminPage() {
  const { skills, certifications } = await readSkillsAndCertifications()
  return (
    <>
      <PageHeader
        eyebrow="Skills & Certifications"
        title="スキル・資格"
        description="ホームの「Skills」と「Certifications」に表示する内容を編集します。"
      />
      <SkillsForm
        initialSkills={skills.map((s) => ({
          name: s.name,
          category: s.category,
          years: s.years == null ? '' : String(s.years),
          description: s.description,
        }))}
        initialCerts={certifications.map((c) => ({
          name: c.name,
          issuer: c.issuer,
          earnedOn: c.earnedOn ?? '',
          expiresOn: c.expiresOn ?? '',
          badgeUrl: c.badgeUrl ?? '',
          credentialUrl: c.credentialUrl ?? '',
        }))}
      />
    </>
  )
}
