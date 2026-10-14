import type { z } from 'zod'

// AI の呼び出しはこのインターフェース越しに行う（テスト・e2e ではモックに差し替える）

export type AiTextRequest = { system: string; prompt: string; maxTokens: number }
export type AiJsonRequest<S extends z.ZodType> = AiTextRequest & { schema: S }

export interface AiProvider {
  generateText(req: AiTextRequest): Promise<string>
  generateJson<S extends z.ZodType>(req: AiJsonRequest<S>): Promise<z.infer<S>>
}

/** 利用者に見せてよいメッセージを持つエラー */
export class AiError extends Error {
  constructor(
    message: string,
    readonly code:
      | 'not_configured'
      | 'refused'
      | 'timeout'
      | 'rate_limited'
      | 'invalid_output'
      | 'upstream'
  ) {
    super(message)
    this.name = 'AiError'
  }
}
