import fs from 'fs'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { openLocalSqlite } from '../../lib/db/local'

// e2e のたびに空のデータベースから始める
export default function globalSetup() {
  const file = '.data/e2e.sqlite'
  for (const f of [file, `${file}-wal`, `${file}-shm`]) fs.rmSync(f, { force: true })
  const sqlite = openLocalSqlite(file)
  migrate(drizzle(sqlite), { migrationsFolder: './drizzle' })
  sqlite.close()
}
