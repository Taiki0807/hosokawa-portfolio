// ビルド前に、接続先の DB にマイグレーションがすべて適用済みかを確かめる（DB_DRIVER=d1 のときのみ）
// 未適用のまま新しい列を SELECT すると、SQLite は "列名" を文字列として返すため
// 「"study_tags" is not valid JSON」のような分かりにくいエラーでビルドが落ちる。ここで先に止める
import { readFileSync } from 'node:fs'
import { sql } from 'drizzle-orm'
import { getDb } from '../lib/db/client'
import { findMissingMigrations, type MigrationJournal } from '../lib/db/migrations-check'

// drizzle は元のエラーを cause に入れて "Failed query: ..." で包む
function describe(err: unknown): string {
  if (!(err instanceof Error)) return String(err)
  return err.cause ? `${err.message}\n  原因: ${describe(err.cause)}` : err.message
}

async function main() {
  if (process.env.DB_DRIVER !== 'd1') {
    console.log('check-migrations: DB_DRIVER が d1 ではないためスキップ')
    return
  }
  const journal = JSON.parse(readFileSync('drizzle/meta/_journal.json', 'utf8')) as MigrationJournal
  const db = getDb()

  let applied: number[] = []
  try {
    // sqlite-proxy の結果は行ごとの配列で返る
    const rows = await db.values<[number]>(sql`SELECT created_at FROM __drizzle_migrations`)
    applied = rows.map((r) => Number(r[0]))
  } catch (err) {
    // テーブルがない = 1 つも適用されていない。それ以外の失敗（接続・認証）はそのまま投げる
    if (!/no such table/i.test(describe(err))) throw err
  }

  const missing = findMissingMigrations(journal, applied)
  if (missing.length > 0) {
    console.error(
      [
        `✗ 接続先の D1（${process.env.CLOUDFLARE_D1_DATABASE_ID}）に未適用のマイグレーションがあります:`,
        ...missing.map((t) => `  - drizzle/${t}.sql`),
        '  適用してから再デプロイしてください: CLOUDFLARE_D1_DATABASE_ID=<対象の ID> pnpm db:migrate:d1',
      ].join('\n')
    )
    process.exit(1)
  }
  console.log(`✓ マイグレーション ${journal.entries.length} 件すべて適用済み`)
}

main().catch((err) => {
  console.error('✗ check-migrations:', describe(err))
  process.exit(1)
})
