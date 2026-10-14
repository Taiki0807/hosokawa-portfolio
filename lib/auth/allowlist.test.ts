import { describe, expect, it } from 'vitest'
import { isAllowedLogin, parseAllowlist } from './allowlist'

describe('parseAllowlist', () => {
  it('カンマ区切り・空白・空要素を扱う', () => {
    expect(parseAllowlist(' Taiki0807, ,other ')).toEqual(['taiki0807', 'other'])
    expect(parseAllowlist(undefined)).toEqual([])
  })
})

describe('isAllowedLogin', () => {
  const list = ['taiki0807']
  it('許可リストのアカウントは許可（大文字・小文字は区別しない）', () => {
    expect(isAllowedLogin('Taiki0807', list)).toBe(true)
  })
  it('許可リスト外・未ログインは拒否', () => {
    expect(isAllowedLogin('visitor-123', list)).toBe(false)
    expect(isAllowedLogin(undefined, list)).toBe(false)
    expect(isAllowedLogin('', list)).toBe(false)
  })
  it('許可リストが空なら誰も入れない', () => {
    expect(isAllowedLogin('taiki0807', [])).toBe(false)
  })
  it('部分一致では通さない', () => {
    expect(isAllowedLogin('taiki', list)).toBe(false)
    expect(isAllowedLogin('taiki08070', list)).toBe(false)
  })
})
