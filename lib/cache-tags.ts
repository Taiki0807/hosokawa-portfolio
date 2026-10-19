import journal from '../drizzle/meta/_journal.json'

// unstable_cache / revalidateTag / updateTag で使うタグ
export const CACHE_TAGS = {
  learning: 'learning',
  goals: 'goals',
  review: 'review',
  skills: 'skills',
  posts: 'posts',
  settings: 'settings',
} as const

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS]

// マイグレーション（データの移行を含む）はアプリの外から D1 を書き換えるので、タグでは無効化されない。
// キーに最新のマイグレーションを含め、適用後のデプロイでは古いキャッシュを使わないようにする
const SCHEMA_VERSION = String(journal.entries.at(-1)?.when ?? 0)

export function cacheKey(name: string): string[] {
  return [name, `schema-${SCHEMA_VERSION}`]
}
