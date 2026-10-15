import { describe, expect, it } from 'vitest'
import { entryInputSchema, resolveEntryStatus } from './schema'

const base = {
  date: '2026-10-15',
  sessions: [{ tag: 'AWS', minutes: 30, memo: 'VPC' }],
  intent: 'draft' as const,
}

describe('entryInputSchema', () => {
  it('正しい入力を通す', () => {
    expect(entryInputSchema.safeParse(base).success).toBe(true)
  })
  it('存在しない日付・0分・空のタグ・合計24時間超えを弾く', () => {
    expect(entryInputSchema.safeParse({ ...base, date: '2026-02-30' }).success).toBe(false)
    expect(
      entryInputSchema.safeParse({ ...base, sessions: [{ tag: 'AWS', minutes: 0 }] }).success
    ).toBe(false)
    expect(
      entryInputSchema.safeParse({ ...base, sessions: [{ tag: ' ', minutes: 10 }] }).success
    ).toBe(false)
    expect(
      entryInputSchema.safeParse({
        ...base,
        sessions: [
          { tag: 'A', minutes: 1000 },
          { tag: 'B', minutes: 500 },
        ],
      }).success
    ).toBe(false)
    expect(entryInputSchema.safeParse({ ...base, sessions: [] }).success).toBe(false)
  })
})

describe('resolveEntryStatus（公開前の確認）', () => {
  const p = { visibility: 'published' as const, reportText: '整えた文章', reportAiPolished: true }

  it('下書き保存は下書き', () => {
    expect(resolveEntryStatus({ ...p, intent: 'draft', aiConfirmed: true }, false).status).toBe(
      'draft'
    )
  })
  it('AI 整形した文章は、確認していなければ公開しない', () => {
    expect(resolveEntryStatus({ ...p, intent: 'publish', aiConfirmed: false }, false)).toEqual({
      status: 'draft',
      blockedByReview: true,
    })
  })
  it('確認済みなら公開', () => {
    expect(resolveEntryStatus({ ...p, intent: 'publish', aiConfirmed: true }, false).status).toBe(
      'published'
    )
  })
  it('「保存と同時に公開」でも、未確認の AI 文章は公開しない', () => {
    expect(resolveEntryStatus({ ...p, intent: 'draft', aiConfirmed: false }, true).status).toBe(
      'draft'
    )
  })
  it('AI を使っていなければ「保存と同時に公開」で公開', () => {
    expect(
      resolveEntryStatus(
        { ...p, reportAiPolished: false, intent: 'draft', aiConfirmed: false },
        true
      ).status
    ).toBe('published')
  })
  it('時間だけ公開', () => {
    expect(
      resolveEntryStatus(
        { ...p, visibility: 'private', intent: 'publish', aiConfirmed: true },
        false
      ).status
    ).toBe('private')
  })
})
