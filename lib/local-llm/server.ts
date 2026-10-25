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

/** キャラクターの口調などは、学習データと同じ system を毎回先頭に付ける（未設定なら API の既定） */
export function withSystemPrompt(messages: ChatMessage[]) {
  const system = process.env.LOCAL_LLM_SYSTEM_PROMPT?.trim()
  return system ? [{ role: 'system' as const, content: system }, ...messages] : messages
}
