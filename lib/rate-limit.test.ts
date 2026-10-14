import { beforeEach, describe, expect, it } from 'vitest'
import { useTestDb } from '@/tests/helpers/test-db'
import { hitRateLimit } from './rate-limit'

beforeEach(() => {
  useTestDb()
})

describe('hitRateLimit', () => {
  it('上限までは許可し、超えたら拒否する', async () => {
    const now = Date.UTC(2026, 9, 15, 0, 0, 0)
    const results = []
    for (let i = 0; i < 4; i++) results.push(await hitRateLimit('ai:test', 3, 3600, now))
    expect(results).toEqual([true, true, true, false])
  })
  it('次のウィンドウではリセットされる', async () => {
    const now = Date.UTC(2026, 9, 15, 0, 0, 0)
    for (let i = 0; i < 3; i++) await hitRateLimit('ai:test', 3, 3600, now)
    expect(await hitRateLimit('ai:test', 3, 3600, now + 3600_000)).toBe(true)
  })
  it('キーごとに数える', async () => {
    const now = Date.UTC(2026, 9, 15)
    await hitRateLimit('a', 1, 60, now)
    expect(await hitRateLimit('b', 1, 60, now)).toBe(true)
  })
})
