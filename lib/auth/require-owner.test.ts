import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMock = vi.fn()
vi.mock('./config', () => ({ auth: () => authMock() }))
vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`)
  },
}))

const { requireOwner, requireOwnerPage, getOwner, UnauthorizedError } =
  await import('./require-owner')
const { adminRoute } = await import('@/lib/http/admin-route')

beforeEach(() => {
  vi.stubEnv('ALLOWED_GITHUB_LOGINS', 'Taiki0807')
  authMock.mockReset()
})

describe('requireOwner（Server Action・API 用）', () => {
  it('許可リストのアカウントは通す', async () => {
    authMock.mockResolvedValue({ user: { login: 'taiki0807', name: 'T' } })
    await expect(requireOwner()).resolves.toMatchObject({ login: 'taiki0807' })
  })
  it('未ログインは拒否', async () => {
    authMock.mockResolvedValue(null)
    await expect(requireOwner()).rejects.toBeInstanceOf(UnauthorizedError)
  })
  it('許可リスト外は拒否', async () => {
    authMock.mockResolvedValue({ user: { login: 'visitor-123' } })
    await expect(requireOwner()).rejects.toBeInstanceOf(UnauthorizedError)
  })
  it('許可リストから外したアカウントは、既存のセッションでも拒否', async () => {
    authMock.mockResolvedValue({ user: { login: 'taiki0807' } })
    vi.stubEnv('ALLOWED_GITHUB_LOGINS', 'someone-else')
    expect(await getOwner()).toBeNull()
  })
})

describe('requireOwnerPage（ページ用）', () => {
  it('未ログインは /login へ', async () => {
    authMock.mockResolvedValue(null)
    await expect(requireOwnerPage()).rejects.toThrow('REDIRECT:/login')
  })
  it('許可リスト外は /forbidden へ', async () => {
    authMock.mockResolvedValue({ user: { login: 'visitor-123' } })
    await expect(requireOwnerPage()).rejects.toThrow('REDIRECT:/forbidden?login=visitor-123')
  })
})

describe('adminRoute（管理用 API）', () => {
  const handler = adminRoute(async (owner) => Response.json({ login: owner.login }))

  it('未ログインは 401 で、ハンドラを呼ばない', async () => {
    authMock.mockResolvedValue(null)
    const inner = vi.fn()
    const res = await adminRoute(inner)()
    expect(res.status).toBe(401)
    expect(inner).not.toHaveBeenCalled()
  })
  it('許可外は 401', async () => {
    authMock.mockResolvedValue({ user: { login: 'visitor-123' } })
    expect((await handler()).status).toBe(401)
  })
  it('オーナーなら実行する', async () => {
    authMock.mockResolvedValue({ user: { login: 'Taiki0807' } })
    const res = await handler()
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ login: 'Taiki0807' })
  })
})
