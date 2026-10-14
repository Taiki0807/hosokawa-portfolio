import { describe, expect, it } from 'vitest'
import { safeCallbackUrl, safeGitHubLogin } from './redirect'

describe('safeCallbackUrl', () => {
  it('/admin 配下だけ許可', () => {
    expect(safeCallbackUrl('/admin/learning')).toBe('/admin/learning')
    expect(safeCallbackUrl('https://evil.example')).toBe('/admin')
    expect(safeCallbackUrl('//evil.example')).toBe('/admin')
    expect(safeCallbackUrl('/blog')).toBe('/admin')
    expect(safeCallbackUrl(undefined)).toBe('/admin')
  })
})

describe('safeGitHubLogin', () => {
  it('GitHub のログイン名の形式だけ通す', () => {
    expect(safeGitHubLogin('visitor-123')).toBe('visitor-123')
    expect(safeGitHubLogin('<script>')).toBeNull()
    expect(safeGitHubLogin('-bad')).toBeNull()
  })
})
