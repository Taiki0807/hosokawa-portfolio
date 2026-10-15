import { describe, expect, it } from 'vitest'
import { isAllowedLinkHref, normalizeSlug, postInputSchema } from './post-schema'

const base = { kind: 'project', title: 'つみノート', intent: 'draft' } as const

describe('normalizeSlug', () => {
  it('大文字・空白・アンダースコアをスラッグの形にする（入力途中の空白も消さない）', () => {
    expect(normalizeSlug('Tsumi Note')).toBe('tsumi-note')
    expect(normalizeSlug('tsumi ')).toBe('tsumi-')
    expect(normalizeSlug('my_app__v2')).toBe('my-app-v2')
  })
  it('URL のような値は触らない', () => {
    expect(normalizeSlug('https://Example.com/A')).toBe('https://Example.com/A')
  })
})

describe('isAllowedLinkHref', () => {
  it.each([
    ['https://play.hosokawa-lab.dev/', true],
    ['http://example.com', true],
    ['/css-notes', true],
    ['//evil.example.com', false],
    ['javascript:alert(1)', false],
    ['example.com', false],
  ])('%s → %s', (href, ok) => expect(isAllowedLinkHref(href)).toBe(ok))
})

describe('postInputSchema', () => {
  it('スラッグに URL を入れたら、リンク欄へ案内するエラー', () => {
    const r = postInputSchema.safeParse({
      ...base,
      slug: 'https://github.com/Taiki0807/tsumi-note',
    })
    expect(r.success).toBe(false)
    expect(r.error?.issues[0].message).toContain('「リンク」欄')
  })

  it('リンクは URL だけ入れればボタンの文字を補う', () => {
    const r = postInputSchema.parse({
      ...base,
      slug: 'tsumi-note',
      linkHref: 'https://tsumi-note.example.com',
    })
    expect(r.linkLabel).toBe('サイトを見る')
  })

  it('危険なリンクは保存しない', () => {
    const r = postInputSchema.safeParse({ ...base, slug: 'a', linkHref: 'javascript:alert(1)' })
    expect(r.success).toBe(false)
  })
})
