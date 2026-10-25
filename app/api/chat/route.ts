import { NextResponse } from 'next/server'
import { clientKey } from '@/lib/client-key'
import { chatRequestSchema } from '@/lib/local-llm/chat'
import {
  CHAT_MAX_NEW_TOKENS,
  CHAT_RATE_LIMIT,
  localLlmBaseUrl,
  withSystemPrompt,
} from '@/lib/local-llm/server'
import { hitRateLimit } from '@/lib/rate-limit'

// 長い返事は 10〜15 秒ほどかかる。上流の打ち切りは関数の上限より少し前にする
export const maxDuration = 60
const UPSTREAM_TIMEOUT_MS = 55_000

function error(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

/** ホームの AI チャット。ブラウザからローカル LLM を直接呼ばず、ここで検証・回数制限してから中継する */
export async function POST(request: Request) {
  const base = localLlmBaseUrl()
  if (!base) return error('AIチャットは現在使えません。', 503)

  const parsed = chatRequestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return error('送信内容を確認してください。', 400)

  if (
    !(await hitRateLimit(
      `chat:${clientKey(request)}`,
      CHAT_RATE_LIMIT.limit,
      CHAT_RATE_LIMIT.windowSeconds
    ))
  ) {
    return error('送信回数の上限に達しました。時間をおいてお試しください。', 429)
  }

  let upstream: Response
  try {
    upstream = await fetch(`${base}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: withSystemPrompt(parsed.data.messages),
        stream: true,
        max_new_tokens: CHAT_MAX_NEW_TOKENS,
      }),
      // 閲覧者が止めたら上流の生成も止める
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)]),
      cache: 'no-store',
    })
  } catch (err) {
    // 会話の内容はログに残さない
    console.error('Local LLM unreachable:', err instanceof Error ? err.name : 'unknown')
    return error('AIに接続できませんでした。今は止まっているかもしれません。', 502)
  }

  if (upstream.status === 503) {
    return error('AIは準備中です。少し待ってからお試しください。', 503)
  }
  if (!upstream.ok || !upstream.body) {
    console.error('Local LLM error:', upstream.status)
    return error('AIの呼び出しに失敗しました。', 502)
  }

  return new Response(upstream.body, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Accel-Buffering': 'no',
    },
  })
}
