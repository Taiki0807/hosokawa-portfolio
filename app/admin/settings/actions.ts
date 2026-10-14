'use server'

import { updateTag } from 'next/cache'
import { ownerAction } from '@/lib/admin/action'
import { goalsFormSchema } from '@/lib/admin/settings-schema'
import { getDb } from '@/lib/db/client'
import { certTargets, goals } from '@/lib/db/schema'
import { CACHE_TAGS } from '@/lib/cache-tags'
import { aiSettingsSchema, publishSettingsSchema, writeSetting } from '@/lib/settings'
import { z } from 'zod'

export const saveGoals = ownerAction(goalsFormSchema, async (input) => {
  const db = getDb()
  // 一覧をまるごと置き換える（D1 のバッチは原子的）
  const statements = [
    db.delete(certTargets),
    db.delete(goals),
    ...(input.certTargets.length
      ? [db.insert(certTargets).values(input.certTargets.map((c, sort) => ({ ...c, sort })))]
      : []),
    ...(input.goals.length
      ? [db.insert(goals).values(input.goals.map((g, sort) => ({ ...g, sort })))]
      : []),
  ] as const
  await db.batch(statements as unknown as Parameters<typeof db.batch>[0])
  updateTag(CACHE_TAGS.goals)
  return null
})

export const savePublishAndAi = ownerAction(
  z.object({ publish: publishSettingsSchema, ai: aiSettingsSchema }),
  async (input) => {
    await writeSetting('publish', input.publish)
    await writeSetting('ai', input.ai)
    updateTag(CACHE_TAGS.settings)
    updateTag(CACHE_TAGS.learning)
    return null
  }
)
