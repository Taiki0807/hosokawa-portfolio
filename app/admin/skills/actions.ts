'use server'

import { updateTag } from 'next/cache'
import { z } from 'zod'
import { ownerAction } from '@/lib/admin/action'
import { getDb } from '@/lib/db/client'
import { certifications, skills, SKILL_CATEGORIES } from '@/lib/db/schema'
import { CACHE_TAGS } from '@/lib/cache-tags'
import { isAllowedImageUrl } from '@/lib/r2'

const dateish = z
  .string()
  .trim()
  .default('')
  .refine(
    (v) => v === '' || /^\d{4}-(0[1-9]|1[0-2])(-\d{2})?$/.test(v),
    'YYYY-MM か YYYY-MM-DD で入力してください'
  )
  .transform((v) => v || null)

const schema = z.object({
  skills: z
    .array(
      z.object({
        name: z.string().trim().min(1, '技術名を入力してください').max(40),
        category: z.enum(SKILL_CATEGORIES),
        years: z.preprocess(
          (v) => (v === '' || v == null ? null : Number(v)),
          z.number().min(0).max(60).nullable()
        ),
        description: z.string().trim().max(200).default(''),
      })
    )
    .max(40),
  certifications: z
    .array(
      z.object({
        name: z.string().trim().min(1, '資格名を入力してください').max(120),
        issuer: z.string().trim().max(60).default(''),
        earnedOn: dateish,
        expiresOn: dateish,
        badgeUrl: z
          .string()
          .trim()
          .default('')
          .refine(
            (v) => v === '' || isAllowedImageUrl(v),
            'バッジ画像はアップロードしたものを使ってください'
          )
          .transform((v) => v || null),
        credentialUrl: z
          .string()
          .trim()
          .default('')
          .refine((v) => v === '' || /^https:\/\//.test(v), '検証URLは https:// から始めてください')
          .transform((v) => v || null),
      })
    )
    .max(30),
})

export const saveSkillsAndCertifications = ownerAction(schema, async (input) => {
  const db = getDb()
  const statements = [
    db.delete(skills),
    db.delete(certifications),
    ...(input.skills.length
      ? [db.insert(skills).values(input.skills.map((s, sort) => ({ ...s, sort })))]
      : []),
    ...(input.certifications.length
      ? [db.insert(certifications).values(input.certifications.map((c, sort) => ({ ...c, sort })))]
      : []),
  ]
  await db.batch(statements as unknown as Parameters<typeof db.batch>[0])
  updateTag(CACHE_TAGS.skills)
  return null
})
