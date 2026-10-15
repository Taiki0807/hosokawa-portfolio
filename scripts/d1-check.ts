// 開発用 D1 への接続確認（pnpm db:check:d1）
// 1 文の読み取り・バッチでの書き込みと読み戻し・後片付けを順に試す。本番 D1 にはガードで接続しない
import { count, eq } from 'drizzle-orm'
import { getDb } from '../lib/db/client'
import { rateLimits, skills } from '../lib/db/schema'

async function main() {
  const db = getDb()
  const key = `d1-check:${Date.now()}`

  const [{ n }] = await db.select({ n: count() }).from(skills)
  console.log(`✓ 読み取り：skill テーブル ${n} 件`)

  const [, , rows] = await db.batch([
    db.insert(rateLimits).values({ key, windowStart: 1, count: 1 }),
    db.insert(rateLimits).values({ key, windowStart: 2, count: 2 }),
    db.select().from(rateLimits).where(eq(rateLimits.key, key)),
  ])
  if (rows.length !== 2) throw new Error(`バッチの結果が想定と違います：${JSON.stringify(rows)}`)
  console.log('✓ バッチ：2 件書き込み、同じバッチ内で読み戻し')

  await db.delete(rateLimits).where(eq(rateLimits.key, key))
  console.log('✓ 後片付け：確認用の行を削除')
}

if (process.env.DB_DRIVER !== 'd1' && !process.env.D1_CHECK_ALLOW_LOCAL) {
  console.error('DB_DRIVER=d1 にしてから実行してください')
  process.exit(1)
}
main().catch((err) => {
  console.error('✗', err instanceof Error ? err.message : err)
  process.exit(1)
})
