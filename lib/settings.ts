import { unstable_cache } from 'next/cache'
import { inArray } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '@/lib/db/client'
import { siteSettings } from '@/lib/db/schema'
import { CACHE_TAGS } from '@/lib/cache-tags'

// 「AI整形バッジの表示」「公開前の確認」は固定のため、設定項目にしない

export const publishSettingsSchema = z.object({
  /** 学習ログ（最近の記録・Day detail）を公開する */
  showLog: z.boolean(),
  /** 草（ヒートマップ・統計）を公開する */
  showHeatmap: z.boolean(),
  /** 詳細ノート（/learning/[date]）を公開する */
  showNotes: z.boolean(),
  /** 記録の保存と同時に公開する（AI 整形した文章は、本人の確認後でないと公開されない） */
  publishOnSave: z.boolean(),
})

export const aiSettingsSchema = z.object({
  enabled: z.boolean(),
  tone: z.enum(['desu', 'da']),
  length: z.enum(['short', 'mid', 'long']),
})

export type PublishSettings = z.infer<typeof publishSettingsSchema>
export type AiSettings = z.infer<typeof aiSettingsSchema>
export type SiteSettings = { publish: PublishSettings; ai: AiSettings }

export const DEFAULT_SETTINGS: SiteSettings = {
  publish: { showLog: true, showHeatmap: true, showNotes: true, publishOnSave: false },
  ai: { enabled: true, tone: 'desu', length: 'mid' },
}

export async function readSettings(): Promise<SiteSettings> {
  const rows = await getDb()
    .select()
    .from(siteSettings)
    .where(inArray(siteSettings.key, ['publish', 'ai']))
  const byKey = new Map(rows.map((r) => [r.key, r.value]))
  const publish = publishSettingsSchema.safeParse({
    ...DEFAULT_SETTINGS.publish,
    ...(byKey.get('publish') as object),
  })
  const ai = aiSettingsSchema.safeParse({ ...DEFAULT_SETTINGS.ai, ...(byKey.get('ai') as object) })
  return {
    publish: publish.success ? publish.data : DEFAULT_SETTINGS.publish,
    ai: ai.success ? ai.data : DEFAULT_SETTINGS.ai,
  }
}

export const getSettings = unstable_cache(readSettings, ['site-settings'], {
  tags: [CACHE_TAGS.settings],
})

export async function writeSetting<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
  const schema = key === 'publish' ? publishSettingsSchema : aiSettingsSchema
  const parsed = schema.parse(value)
  await getDb()
    .insert(siteSettings)
    .values({ key, value: parsed })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { value: parsed, updatedAt: new Date().toISOString() },
    })
}
