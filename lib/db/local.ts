import fs from 'fs'
import path from 'path'
import type { AsyncBatchRemoteCallback, AsyncRemoteCallback } from 'drizzle-orm/sqlite-proxy'
import type DatabaseType from 'better-sqlite3'

// ローカル開発・テスト用。better-sqlite3 を D1 HTTP と同じ sqlite-proxy の形で包む

export const DEFAULT_LOCAL_DB_PATH = path.join(process.cwd(), '.data', 'dev.sqlite')

export function openLocalSqlite(file = process.env.LOCAL_DB_PATH || DEFAULT_LOCAL_DB_PATH) {
  // better-sqlite3 はネイティブモジュールのため、使うときだけ読み込む（本番バンドルに含めない）
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Database = require('better-sqlite3') as typeof DatabaseType
  if (file !== ':memory:') fs.mkdirSync(path.dirname(file), { recursive: true })
  const sqlite = new Database(file)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')
  return sqlite
}

type Method = 'run' | 'all' | 'values' | 'get'

export function createLocalCallbacks(sqlite: DatabaseType.Database): {
  query: AsyncRemoteCallback
  batch: AsyncBatchRemoteCallback
} {
  function exec(sql: string, params: unknown[], method: Method) {
    const stmt = sqlite.prepare(sql)
    if (method === 'run' || !stmt.reader) {
      stmt.run(...params)
      return { rows: [] }
    }
    stmt.raw(true)
    if (method === 'get') return { rows: (stmt.get(...params) as unknown[]) ?? [] }
    return { rows: stmt.all(...params) as unknown[][] }
  }

  return {
    query: async (sql, params, method) => exec(sql, params, method),
    batch: async (queries) =>
      sqlite.transaction(() => queries.map((q) => exec(q.sql, q.params, q.method)))(),
  }
}
