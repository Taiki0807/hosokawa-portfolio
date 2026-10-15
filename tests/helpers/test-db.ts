import { drizzle as drizzleSync } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { drizzle } from 'drizzle-orm/sqlite-proxy'
import * as schema from '@/lib/db/schema'
import { createLocalCallbacks, openLocalSqlite } from '@/lib/db/local'
import { setDbForTesting, type Db } from '@/lib/db/client'

/** マイグレーション済みのインメモリ DB を作り、getDb() が返すように差し替える */
export function useTestDb(): Db {
  const sqlite = openLocalSqlite(':memory:')
  migrate(drizzleSync(sqlite), { migrationsFolder: './drizzle' })
  const { query, batch } = createLocalCallbacks(sqlite)
  const db = drizzle(query, batch, { schema })
  setDbForTesting(db)
  return db
}
