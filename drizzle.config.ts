import { defineConfig } from 'drizzle-kit'

// マイグレーションの生成: pnpm db:generate
// D1 への適用: pnpm db:migrate:d1（DB_DRIVER=d1 と Cloudflare の環境変数が必要）
// ローカルへの適用: pnpm db:migrate:local
export default defineConfig({
  dialect: 'sqlite',
  driver: 'd1-http',
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID ?? '',
    databaseId: process.env.CLOUDFLARE_D1_DATABASE_ID ?? '',
    token: process.env.CLOUDFLARE_API_TOKEN ?? '',
  },
})
