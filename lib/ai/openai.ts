import 'server-only'
import OpenAI from 'openai'
import { zodTextFormat } from 'openai/helpers/zod'
import type { Response } from 'openai/resources/responses/responses'
import type { ReasoningEffort } from 'openai/resources/shared'
import type { z } from 'zod'
import { AiError, type AiJsonRequest, type AiProvider, type AiTextRequest } from './types'

const TIMEOUT_MS = 50_000
// 推論モデルは考える分も出力トークンに数えるため、本文の上限に余裕を足す
const REASONING_HEADROOM_TOKENS = 8_000

const EFFORTS = new Set(['none', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max'])

function client() {
  if (!process.env.OPENAI_API_KEY) {
    throw new AiError('AI の API キーが設定されていません。', 'not_configured')
  }
  return new OpenAI({ timeout: TIMEOUT_MS, maxRetries: 1 })
}

function baseParams(req: AiTextRequest) {
  // モデル名は本人が選ぶ（古くなりやすいので既定値は持たない）
  const model = process.env.OPENAI_MODEL
  if (!model)
    throw new AiError('AI のモデル（OPENAI_MODEL）が設定されていません。', 'not_configured')
  const effort = process.env.OPENAI_REASONING_EFFORT
  return {
    model,
    instructions: req.system,
    input: req.prompt,
    max_output_tokens: req.maxTokens + REASONING_HEADROOM_TOKENS,
    // 学習ログを OpenAI 側に保存させない
    store: false,
    ...(effort && EFFORTS.has(effort) ? { reasoning: { effort: effort as ReasoningEffort } } : {}),
  }
}

function hasRefusal(res: Response) {
  return res.output.some(
    (item) => item.type === 'message' && item.content.some((c) => c.type === 'refusal')
  )
}

function checkFinished(res: Response, refusedMessage: string) {
  if (hasRefusal(res)) throw new AiError(refusedMessage, 'refused')
  if (res.status === 'incomplete') {
    const reason = res.incomplete_details?.reason
    if (reason === 'content_filter') throw new AiError(refusedMessage, 'refused')
    throw new AiError('AI の出力が途中で終わりました。もう一度お試しください。', 'invalid_output')
  }
}

function toAiError(err: unknown): never {
  if (err instanceof AiError) throw err
  // SDK が出力を JSON として読む・スキーマで検証するときの失敗
  if (err instanceof SyntaxError || (err instanceof Error && err.name === 'ZodError')) {
    throw new AiError('AI の出力が決められた形式ではありませんでした。', 'invalid_output')
  }
  if (err instanceof OpenAI.RateLimitError) {
    throw new AiError(
      'AI の利用が混み合っています。少し待ってからもう一度お試しください。',
      'rate_limited'
    )
  }
  if (err instanceof OpenAI.APIConnectionTimeoutError) {
    throw new AiError('AI の応答がタイムアウトしました。もう一度お試しください。', 'timeout')
  }
  if (err instanceof OpenAI.AuthenticationError) {
    throw new AiError('AI の API キーが正しくありません。', 'not_configured')
  }
  if (err instanceof OpenAI.APIError) {
    console.error('OpenAI API error', err.status, err.message)
    throw new AiError('AI の呼び出しに失敗しました。', 'upstream')
  }
  throw err
}

export const openaiProvider: AiProvider = {
  async generateText(req) {
    try {
      const res = await client().responses.create(baseParams(req))
      checkFinished(res, 'AI がこの内容の整形を断りました。文章を直接編集してください。')
      const text = res.output_text.trim()
      if (!text) throw new AiError('AI から文章が返りませんでした。', 'invalid_output')
      return text
    } catch (err) {
      toAiError(err)
    }
  },

  async generateJson<S extends z.ZodType>(req: AiJsonRequest<S>): Promise<z.infer<S>> {
    try {
      const res = await client().responses.parse({
        ...baseParams(req),
        text: { format: zodTextFormat(req.schema, 'output') },
      })
      checkFinished(res, 'AI がこの内容のレビュー作成を断りました。')
      // SDK の検証に加えて、自前のスキーマでも検証する
      const parsed = req.schema.safeParse(res.output_parsed)
      if (!parsed.success)
        throw new AiError('AI の出力が決められた形式ではありませんでした。', 'invalid_output')
      return parsed.data
    } catch (err) {
      toAiError(err)
    }
  },
}
