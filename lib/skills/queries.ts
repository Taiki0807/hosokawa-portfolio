import { unstable_cache } from 'next/cache'
import { asc } from 'drizzle-orm'
import { getDb } from '@/lib/db/client'
import { certifications, skills } from '@/lib/db/schema'
import { CACHE_TAGS, cacheKey } from '@/lib/cache-tags'
import type { Certification, Skill } from '@/data'

export async function readSkillsAndCertifications() {
  const db = getDb()
  const [skillRows, certRows] = await db.batch([
    db.select().from(skills).orderBy(asc(skills.sort), asc(skills.id)),
    db.select().from(certifications).orderBy(asc(certifications.sort), asc(certifications.id)),
  ])
  return { skills: skillRows, certifications: certRows }
}

export const getSkillsAndCertifications = unstable_cache(
  readSkillsAndCertifications,
  cacheKey('skills'),
  {
    tags: [CACHE_TAGS.skills],
  }
)

/** 既存のスキル表示（内側の軌道 = 実務経験あり）に合わせた形にする */
export function toSkillItems(rows: (typeof skills.$inferSelect)[]): Skill[] {
  return rows.map((r) => ({
    name: r.name,
    // 経験年数は本人が入力したときだけ表示する
    description: r.years != null ? `${r.description}（経験${r.years}年）` : r.description,
    hasExperience: r.category !== 'learning',
  }))
}

export function toCertificationItems(
  rows: (typeof certifications.$inferSelect)[]
): Certification[] {
  return rows.map((r) => ({
    name: r.name,
    date: r.earnedOn ?? '',
    badgeUrl: r.badgeUrl ?? undefined,
    credentialUrl: r.credentialUrl ?? undefined,
  }))
}
