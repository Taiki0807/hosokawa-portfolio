import { drizzle, type SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy'
import * as schema from './schema'
import { createD1HttpCallbacks } from './d1-http'

export type Db = SqliteRemoteDatabase<typeof schema>

let cached: Db | undefined

export function getDb(): Db {
  if (!cached) cached = createDb()
  return cached
}

// テストで差し替える用
export function setDbForTesting(db: Db | undefined) {
  cached = db
}

function resolveDriver(): 'local' | 'd1' {
  const driver = process.env.DB_DRIVER
  if (driver === 'local' || driver === 'd1') return driver
  if (driver) throw new Error(`DB_DRIVER must be "local" or "d1" (got "${driver}")`)
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
    throw new Error('DB_DRIVER is not set')
  }
  return 'local'
}

function createDb(): Db {
  if (resolveDriver() === 'local') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { openLocalSqlite, createLocalCallbacks } = require('./local') as typeof import('./local')
    const { query, batch } = createLocalCallbacks(openLocalSqlite())
    return drizzle(query, batch, { schema })
  }

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID
  const token = process.env.CLOUDFLARE_API_TOKEN
  if (!accountId || !databaseId || !token) {
    throw new Error(
      'CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_D1_DATABASE_ID / CLOUDFLARE_API_TOKEN are required'
    )
  }
  assertNotProductionFromDev(databaseId)

  const { query, batch } = createD1HttpCallbacks({ accountId, databaseId, token })
  return drizzle(query, batch, { schema })
}

// 開発環境・プレビュー環境から本番 D1 に接続しないためのガード
// CLOUDFLARE_D1_PRODUCTION_DATABASE_ID（ID のみ。秘密情報ではない）をローカルにも設定しておく
export function assertNotProductionFromDev(
  databaseId: string,
  env: Record<string, string | undefined> = process.env
) {
  const prodId = env.CLOUDFLARE_D1_PRODUCTION_DATABASE_ID
  const isProductionDeploy = env.VERCEL_ENV === 'production'
  if (prodId && databaseId === prodId && !isProductionDeploy) {
    throw new Error(
      'Refusing to connect to the production D1 database outside the production deployment'
    )
  }
}
