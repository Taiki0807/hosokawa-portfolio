import 'server-only'
import Anthropic from '@anthropic-ai/sdk'
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod'
import type { z } from 'zod'
import { AiError, type AiJsonRequest, type AiProvider, type AiTextRequest } from './types'

const DEFAULT_MODEL = 'claude-opus-5-5'
const TIMEOUT_MS = 50_000

// 安全性の判定で断られたとき、サーバー側で別モデルに引き継ぐ（対応モデルのみ）
const FALLBACK_MODELS = new Set([
  'claude-opus-5-5',
  'claude-opus-5',
  'claude-fable-5-1',
  'claude-sonnet-5-5',
])

function client() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new AiError('AI の API キーが設定されていません。', 'not_configured')
  }
  return new Anthropic({ timeout: TIMEOUT_MS, maxRetries: 1 })
}

function baseParams(req: AiTextRequest) {
  const model = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL
  return {
    model,
    max_tokens: req.maxTokens,
    system: req.system,
    messages: [{ role: 'user' as const, content: req.prompt }],
    ...(FALLBACK_MODELS.has(model)
      ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const }
      : {}),
  }
}

function toAiError(err: unknown): never {
  if (err instanceof AiError) throw err
  if (err instanceof Anthropic.RateLimitError) {
    throw new AiError(
      'AI の利用が混み合っています。少し待ってからもう一度お試しください。',
      'rate_limited'
    )
  }
  if (err instanceof Anthropic.APIConnectionTimeoutError) {
    throw new AiError('AI の応答がタイムアウトしました。もう一度お試しください。', 'timeout')
  }
  if (err instanceof Anthropic.AuthenticationError) {
    throw new AiError('AI の API キーが正しくありません。', 'not_configured')
  }
  if (err instanceof Anthropic.APIError) {
    console.error('Anthropic API error', err.status, err.message)
    throw new AiError('AI の呼び出しに失敗しました。', 'upstream')
  }
  throw err
}

export const anthropicProvider: AiProvider = {
  async generateText(req) {
    try {
      const res = await client().beta.messages.create({
        ...baseParams(req),
        output_config: { effort: 'low' },
      })
      if (res.stop_reason === 'refusal') {
        throw new AiError(
          'AI がこの内容の整形を断りました。文章を直接編集してください。',
          'refused'
        )
      }
      const text = res.content
        .flatMap((b) => (b.type === 'text' ? [b.text] : []))
        .join('')
        .trim()
      if (!text) throw new AiError('AI から文章が返りませんでした。', 'invalid_output')
      return text
    } catch (err) {
      toAiError(err)
    }
  },

  async generateJson<S extends z.ZodType>(req: AiJsonRequest<S>): Promise<z.infer<S>> {
    try {
      const res = await client().beta.messages.parse({
        ...baseParams(req),
        output_config: { effort: 'medium', format: betaZodOutputFormat(req.schema) },
      })
      if (res.stop_reason === 'refusal') {
        throw new AiError('AI がこの内容のレビュー作成を断りました。', 'refused')
      }
      // SDK の検証に加えて、自前のスキーマでも検証する
      const parsed = req.schema.safeParse(res.parsed_output)
      if (!parsed.success)
        throw new AiError('AI の出力が決められた形式ではありませんでした。', 'invalid_output')
      return parsed.data
    } catch (err) {
      toAiError(err)
    }
  },
}
