import { defineConfig, devices } from '@playwright/test'

const PORT = 3200
export const E2E_SECRET = 'e2e-secret-not-for-production-0123456789'
export const E2E_OWNER = 'e2e-owner'

// e2e は専用のローカル SQLite と AI のモックで動かす（外部サービスに接続しない）
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  use: { baseURL: `http://localhost:${PORT}`, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  globalSetup: './tests/e2e/global-setup.ts',
  webServer: {
    command: `pnpm next dev --port ${PORT}`,
    url: `http://localhost:${PORT}/login`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      DB_DRIVER: 'local',
      LOCAL_DB_PATH: '.data/e2e.sqlite',
      AI_PROVIDER: 'mock',
      AUTH_SECRET: E2E_SECRET,
      AUTH_GITHUB_ID: 'e2e',
      AUTH_GITHUB_SECRET: 'e2e',
      ALLOWED_GITHUB_LOGINS: E2E_OWNER,
      NEXT_DIST_DIR: '.next-e2e',
      // 本物のメールを送らない（送信失敗でも保存される挙動を確かめる）
      RESEND_API_KEY: '',
    },
  },
})
