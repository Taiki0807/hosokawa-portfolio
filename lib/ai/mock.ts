import type { z } from 'zod'
import type { AiProvider } from './types'

// テスト・e2e 用。入力から決まった出力を返す（外部 API を呼ばない）
export const mockProvider: AiProvider = {
  async generateText(req) {
    const memoLine = req.prompt
      .split('\n')
      .find((l) => l.startsWith('- '))
      ?.replace(/^- /, '')
    return `【モック整形】${memoLine ?? '入力をもとに整えた文章'}`
  },
  async generateJson<S extends z.ZodType>(req: { schema: S }): Promise<z.infer<S>> {
    return req.schema.parse({
      comments: [
        {
          tag: '強み',
          title: '【モック】継続して学習している',
          text: '【モック】学習ログの記録をもとにしたコメントです。',
          evidence: [{ label: '学習ログ', href: '/#learning' }],
        },
        {
          tag: '期待',
          title: '【モック】説明する機会を増やす',
          text: '【モック】伸びしろについてのコメントです。',
          evidence: [],
        },
      ],
    })
  },
}
