import { describe, expect, it } from 'vitest'
import { validateImageUpload } from './upload-rules'

describe('validateImageUpload', () => {
  it('png/jpg/webp/svg・2MB 以下だけ許可', () => {
    expect(validateImageUpload('image/png', 1000).ok).toBe(true)
    expect(validateImageUpload('image/svg+xml', 2 * 1024 * 1024).ok).toBe(true)
    expect(validateImageUpload('image/gif', 1000).ok).toBe(false)
    expect(validateImageUpload('text/html', 1000).ok).toBe(false)
    expect(validateImageUpload('image/png', 2 * 1024 * 1024 + 1).ok).toBe(false)
    expect(validateImageUpload('image/png', 0).ok).toBe(false)
  })
})
