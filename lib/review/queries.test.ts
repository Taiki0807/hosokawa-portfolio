import { describe, expect, it } from 'vitest'
import { safeEvidenceHref } from './queries'

describe('safeEvidenceHref', () => {
  it('サイト内・アンカー・https だけ許可', () => {
    expect(safeEvidenceHref('/learning/2026-10-14')).toBe('/learning/2026-10-14')
    expect(safeEvidenceHref('#learning')).toBe('#learning')
    expect(safeEvidenceHref('https://example.com')).toBe('https://example.com')
    expect(safeEvidenceHref('javascript:alert(1)')).toBeNull()
    expect(safeEvidenceHref('//evil.example')).toBeNull()
    expect(safeEvidenceHref('http://example.com')).toBeNull()
  })
})
