import { describe, expect, it } from 'vitest'
import { buildPolishPrompt, findUnexpectedMinutes, polishReport } from './polish-report'
import type { AiProvider } from './types'

const input = {
  date: '2026-10-15',
  sessions: [
    { tag: 'AWS', minutes: 30, memo: 'VPCを見直した' },
    { tag: 'Terraform', minutes: 60, memo: '' },
  ],
  noteMd: '## 学んだこと\n参照の向き',
}

describe('buildPolishPrompt', () => {
  it('渡すのは日付・タグ・分数・メモ・詳細ノートだけ', () => {
    const { prompt, system } = buildPolishPrompt(input, { tone: 'desu', length: 'mid' })
    expect(prompt).toContain('日付: 2026-10-15')
    expect(prompt).toContain('合計: 90分')
    expect(prompt).toContain('- [AWS] 30分: VPCを見直した')
    expect(prompt).toContain('- [Terraform] 60分: （メモなし）')
    expect(prompt).toContain('参照の向き')
    expect(system).toContain('です・ます調')
    expect(system).toContain('入力にない事実')
  })
  it('文体・長さの設定を反映する', () => {
    const { system } = buildPolishPrompt(input, { tone: 'da', length: 'short' })
    expect(system).toContain('だ・である調')
    expect(system).toContain('2〜3文')
  })
  it('詳細ノートがなければ載せない', () => {
    expect(
      buildPolishPrompt({ ...input, noteMd: '' }, { tone: 'da', length: 'mid' }).prompt
    ).not.toContain('詳細ノート')
  })
})

describe('findUnexpectedMinutes', () => {
  it('入力にない分数を見つける', () => {
    expect(findUnexpectedMinutes('AWSを30分、合計90分学習した。', input)).toEqual([])
    expect(findUnexpectedMinutes('AWSを45分学習した。', input)).toEqual([45])
  })
})

describe('polishReport', () => {
  const provider = (text: string): AiProvider => ({
    generateText: async () => text,
    generateJson: async () => {
      throw new Error('unused')
    },
  })
  it('時間を書き換えた出力は使わない', async () => {
    await expect(
      polishReport(provider('AWSを120分学習した。'), input, { tone: 'desu', length: 'mid' })
    ).rejects.toThrow('学習時間')
  })
  it('問題なければ文章を返す', async () => {
    await expect(
      polishReport(provider('AWSを30分学習しました。'), input, { tone: 'desu', length: 'mid' })
    ).resolves.toBe('AWSを30分学習しました。')
  })
})
