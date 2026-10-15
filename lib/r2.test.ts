import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createImageUploadUrl } from './r2'

beforeEach(() => {
  vi.stubEnv('R2_ACCOUNT_ID', 'acc')
  vi.stubEnv('R2_ACCESS_KEY_ID', 'key')
  vi.stubEnv('R2_SECRET_ACCESS_KEY', 'secret')
  vi.stubEnv('R2_BUCKET', 'bucket')
  vi.stubEnv('R2_PUBLIC_BASE_URL', 'https://img.example.com/')
})
afterEach(() => vi.unstubAllEnvs())

describe('createImageUploadUrl', () => {
  it('保存キーはサーバーが決め、種類とサイズを署名に含める', async () => {
    const { url, key, publicUrl } = await createImageUploadUrl({
      contentType: 'image/png',
      size: 1234,
      prefix: 'badges',
    })
    expect(key).toMatch(/^badges\/[0-9a-f-]{36}\.png$/)
    expect(publicUrl).toBe(`https://img.example.com/${key}`)
    const u = new URL(url)
    expect(u.host).toBe('bucket.acc.r2.cloudflarestorage.com')
    expect(u.searchParams.get('X-Amz-SignedHeaders')).toBe('content-length;content-type;host')
  })

  it('空の本文のチェックサムを URL に入れない（入ると実際の PUT が失敗する）', async () => {
    const { url } = await createImageUploadUrl({
      contentType: 'image/webp',
      size: 10,
      prefix: 'posts',
    })
    const keys = [...new URL(url).searchParams.keys()].map((k) => k.toLowerCase())
    expect(
      keys.some((k) => k.startsWith('x-amz-checksum') || k === 'x-amz-sdk-checksum-algorithm')
    ).toBe(false)
  })

  it('種類やサイズが条件外なら発行しない', async () => {
    await expect(
      createImageUploadUrl({ contentType: 'image/gif', size: 10, prefix: 'badges' })
    ).rejects.toThrow()
    await expect(
      createImageUploadUrl({ contentType: 'image/png', size: 3 * 1024 * 1024, prefix: 'badges' })
    ).rejects.toThrow()
  })
})
