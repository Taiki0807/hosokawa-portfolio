import { describe, expect, it } from 'vitest'
import {
  buildReviewPrompt,
  generateReview,
  sanitizeReview,
  type ReviewContext,
} from './generate-review'
import type { AiProvider } from './types'

const ctx: ReviewContext = {
  period: { from: '2025-10-16', to: '2026-10-15' },
  stats: { studyDays: 220, totalHours: 222, currentStreak: 25, longestStreak: 31, entryCount: 230 },
  tagHours: [
    { tag: 'AWS', hours: 40 },
    { tag: 'Terraform', hours: 24 },
  ],
  notes: [{ date: '2026-10-14', title: 'スタック分割', excerpt: 'Export と参照の向き' }],
  works: [
    {
      kind: 'project',
      title: 'CSS Notes',
      description: 'CSS の学習記録',
      href: '/projects/css-notes',
    },
  ],
}

describe('buildReviewPrompt', () => {
  it('集計・ノート・成果物と、使ってよいリンクを渡す', () => {
    const { prompt, system } = buildReviewPrompt(ctx, 'tech', ['log', 'notes', 'works'])
    expect(prompt).toContain('記録した日: 220日')
    expect(prompt).toContain('AWS: 40時間')
    expect(prompt).toContain('### 2026-10-14 スタック分割')
    expect(prompt).toContain('[project] CSS Notes')
    expect(prompt).toContain('- /learning/2026-10-14')
    expect(system).toContain('技術選定')
    expect(system).toContain('最低1件は tag を「期待」')
  })
  it('選ばなかった根拠データは渡さない', () => {
    const { prompt } = buildReviewPrompt(ctx, 'boss', ['log'])
    expect(prompt).not.toContain('スタック分割')
    expect(prompt).not.toContain('CSS Notes')
    expect(prompt).not.toContain('/learning/2026-10-14')
  })
})

describe('sanitizeReview', () => {
  const base = { tag: '強み' as const, title: 't', text: 'x' }
  it('許可していないリンクを取り除く', () => {
    const out = sanitizeReview(
      [
        {
          ...base,
          evidence: [
            { label: 'ok', href: '/#learning' },
            { label: 'ng', href: 'https://evil.example' },
          ],
        },
        { ...base, tag: '期待', evidence: [{ label: 'note', href: '/learning/2026-10-14' }] },
      ],
      ctx
    )
    expect(out[0].evidence).toEqual([{ label: 'ok', href: '/#learning' }])
    expect(out[1].evidence).toHaveLength(1)
  })
  it('「期待」がなければエラー', () => {
    expect(() => sanitizeReview([{ ...base, evidence: [] }], ctx)).toThrow('期待')
  })
})

describe('generateReview', () => {
  it('JSON スキーマで固定した出力を返す', async () => {
    const provider: AiProvider = {
      generateText: async () => '',
      generateJson: async ({ schema }) =>
        schema.parse({
          comments: [
            { tag: '強み', title: 'a', text: '220日', evidence: [] },
            { tag: '技術', title: 'b', text: 'AWS 40時間', evidence: [] },
            { tag: '期待', title: 'c', text: 'テストの記録', evidence: [] },
          ],
        }),
    }
    const out = await generateReview(provider, ctx, 'tech', ['log'])
    expect(out.map((d) => d.tag)).toEqual(['強み', '技術', '期待'])
  })
})
