import { describe, expect, it } from 'vitest'
import { renderMarkdown } from './render'

describe('renderMarkdown', () => {
  it('見出し・リスト・表（GFM）を描画する', () => {
    const html = renderMarkdown('## 学んだこと\n\n- a\n- b\n\n| x | y |\n|---|---|\n| 1 | 2 |')
    expect(html).toContain('<h2>学んだこと</h2>')
    expect(html).toContain('<li>a</li>')
    expect(html).toContain('<table>')
  })

  it('生の HTML・script は描画しない', () => {
    const html = renderMarkdown(
      '<script>alert(1)</script>\n\n<img src=x onerror="alert(1)">\n\n<div onclick="x">hi</div>'
    )
    expect(html).not.toMatch(/<script|onerror|onclick|<img|<div/i)
  })

  it('javascript: の URL を除く', () => {
    const html = renderMarkdown('[click](javascript:alert(1))\n\n![x](javascript:alert(1))')
    expect(html).not.toContain('javascript:')
  })

  it('外部リンクは新しいタブで、参照元を渡さない', () => {
    const html = renderMarkdown('[docs](https://example.com)')
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noopener noreferrer nofollow"')
  })

  it('> [!TIP] を Callout にする', () => {
    const html = renderMarkdown('> [!TIP]\n> 参照されている間は削除できません。')
    expect(html).toContain('md-callout md-callout-success')
    expect(html).toContain('<div class="md-callout-label">Tip</div>')
    expect(html).toContain('参照されている間は削除できません。')
    expect(html).not.toContain('[!TIP]')
  })

  it('ふつうの引用はそのまま', () => {
    expect(renderMarkdown('> quote')).toContain('<blockquote>')
  })

  it('コードブロックに言語名の見出しを付け、中身はエスケープする', () => {
    const html = renderMarkdown('```yaml\na: <b>1</b>\n```')
    expect(html).toContain('<div class="md-code-head">yaml</div>')
    expect(html).toContain('&#x3C;b>1&#x3C;/b>')
  })

  it('class 属性を任意に付けさせない', () => {
    const html = renderMarkdown('[x](https://a.example "t")')
    expect(html).not.toContain('class="md-callout')
  })
})
