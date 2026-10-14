import { describe, expect, it } from 'vitest'
import { assertNotProductionFromDev } from './client'

describe('assertNotProductionFromDev', () => {
  it('本番以外から本番 D1 への接続を拒否する', () => {
    expect(() =>
      assertNotProductionFromDev('prod', { CLOUDFLARE_D1_PRODUCTION_DATABASE_ID: 'prod' })
    ).toThrow()
    expect(() =>
      assertNotProductionFromDev('prod', {
        CLOUDFLARE_D1_PRODUCTION_DATABASE_ID: 'prod',
        VERCEL_ENV: 'preview',
      })
    ).toThrow()
  })
  it('本番デプロイ、または開発用 DB なら許可', () => {
    expect(() =>
      assertNotProductionFromDev('prod', {
        CLOUDFLARE_D1_PRODUCTION_DATABASE_ID: 'prod',
        VERCEL_ENV: 'production',
      })
    ).not.toThrow()
    expect(() =>
      assertNotProductionFromDev('dev', { CLOUDFLARE_D1_PRODUCTION_DATABASE_ID: 'prod' })
    ).not.toThrow()
  })
})
