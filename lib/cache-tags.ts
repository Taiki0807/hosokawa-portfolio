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
