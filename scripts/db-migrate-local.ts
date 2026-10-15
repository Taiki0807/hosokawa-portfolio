// ローカル SQLite（DB_DRIVER=local）にマイグレーションを適用する
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { openLocalSqlite } from '../lib/db/local'

const sqlite = openLocalSqlite()
migrate(drizzle(sqlite), { migrationsFolder: './drizzle' })
sqlite.close()
console.log('Local migrations applied:', process.env.LOCAL_DB_PATH || '.data/dev.sqlite')
