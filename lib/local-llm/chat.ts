import { z } from 'zod'

// ホームの AI チャット（自作のローカル LLM）。クライアントとサーバーの両方で使う

/** 一度に送る履歴の上限（API は履歴を覚えないので、毎回これまでの会話を送る） */
export const CHAT_MAX_MESSAGES = 20
export const CHAT_MAX_USER_CHARS = 1000
const CHAT_MAX_ASSISTANT_CHARS = 8000

// system はサーバーで付ける。ブラウザからは user と assistant だけを受け取る
export const chatRequestSchema = z
  .object({
    messages: z
      .array(
        z.discriminatedUnion('role', [
          z.object({
            role: z.literal('user'),
            content: z.string().trim().min(1).max(CHAT_MAX_USER_CHARS),
          }),
          z.object({
            role: z.literal('assistant'),
            content: z.string().max(CHAT_MAX_ASSISTANT_CHARS),
          }),
        ])
      )
      .min(1)
      .max(CHAT_MAX_MESSAGES),
  })
  .refine((v) => v.messages.at(-1)?.role === 'user', {
    message: '最後はユーザーの発言にしてください',
  })

export type ChatMessage = { role: 'user' | 'assistant'; content: string }

/**
 * Server-Sent Events を少しずつ読む。イベントは空行区切りで、途中で切れて届くことがあるので溜めてから切り出す
 * @returns 届いた文字列を渡す関数。`data: [DONE]` で onDone を呼ぶ
 */
export function createSseReader(handlers: { onDelta: (text: string) => void; onDone: () => void }) {
  let buf = ''
  return (chunk: string) => {
    buf += chunk.replace(/\r\n/g, '\n')
    let i: number
    while ((i = buf.indexOf('\n\n')) >= 0) {
      const event = buf.slice(0, i)
      buf = buf.slice(i + 2)
      const data = event
        .split('\n')
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).replace(/^ /, ''))
        .join('\n')
      if (!data) continue
      if (data === '[DONE]') {
        handlers.onDone()
        continue
      }
      const parsed: unknown = JSON.parse(data)
      if (parsed && typeof parsed === 'object' && 'delta' in parsed) {
        const delta = (parsed as { delta: unknown }).delta
        if (typeof delta === 'string') handlers.onDelta(delta)
      }
    }
  }
}
