import { and, eq, lt, sql } from 'drizzle-orm'
import { getDb } from '@/lib/db/client'
import { rateLimits } from '@/lib/db/schema'

/**
 * D1 の rate_limit テーブルを使った固定ウィンドウのレート制限
 * @returns 許可されれば true
 */
export async function hitRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
  now = Date.now()
) {
  const db = getDb()
  const windowStart = Math.floor(now / 1000 / windowSeconds) * windowSeconds
  const [inserted] = await db.batch([
    db
      .insert(rateLimits)
      .values({ key, windowStart, count: 1 })
      .onConflictDoUpdate({
        target: [rateLimits.key, rateLimits.windowStart],
        set: { count: sql`${rateLimits.count} + 1` },
      })
      .returning({ count: rateLimits.count }),
    // 古いウィンドウを片付ける
    db
      .delete(rateLimits)
      .where(and(eq(rateLimits.key, key), lt(rateLimits.windowStart, windowStart))),
  ])
  return (inserted[0]?.count ?? 1) <= limit
}

export const AI_RATE_LIMIT = { limit: 10, windowSeconds: 60 * 60 }
