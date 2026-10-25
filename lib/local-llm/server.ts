import 'server-only'
import type { ChatMessage } from './chat'

/** 1 つの送信元から 1 時間に送れる回数（GPU 1 枚で 1 件ずつ処理するため、少なめにする） */
export const CHAT_RATE_LIMIT = { limit: 20, windowSeconds: 60 * 60 }
export const CHAT_MAX_NEW_TOKENS = 512

/**
 * ローカル LLM の API の URL。未設定ならチャットを出さない
 * Quick Tunnel の URL は API 側の再起動で変わるので、コードに書かず環境変数で差し替える
 */
export function localLlmBaseUrl(): string | null {
  const raw = process.env.LOCAL_LLM_BASE_URL?.trim()
  if (!raw) return null
  try {
    const url = new URL(raw)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
    return `${url.origin}${url.pathname.replace(/\/+$/, '')}`
  } catch {
    return null
  }
}

export function isLocalLlmEnabled() {
  return localLlmBaseUrl() !== null
}

/** 今のアダプタ（ninja）の口調を出すための system。API のガイドの例と同じ文 */
export const DEFAULT_SYSTEM_PROMPT =
  'あなたは忍者のアシスタント「ハンゾウ」です。必ず「〜でござる」口調で答えます。'

/** キャラクターの口調は、system を毎回先頭に付けて出す（LOCAL_LLM_SYSTEM_PROMPT で差し替えられる） */
export function withSystemPrompt(messages: ChatMessage[]) {
  const system = process.env.LOCAL_LLM_SYSTEM_PROMPT?.trim() || DEFAULT_SYSTEM_PROMPT
  return [{ role: 'system' as const, content: system }, ...messages]
}
