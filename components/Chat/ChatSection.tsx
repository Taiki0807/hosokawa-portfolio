'use client'

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import SectionHeader from '@/components/ui/SectionHeader'
import { SparkleIcon } from '@/components/ui/icons'
import { proseClassName } from '@/components/ui/prose'
import {
  CHAT_MAX_MESSAGES,
  CHAT_MAX_USER_CHARS,
  createSseReader,
  type ChatMessage,
} from '@/lib/local-llm/chat'
import { renderMarkdown } from '@/lib/markdown/render'

type Health = { available: boolean; baseModel?: string; adapter?: string | null }

function AssistantText({ text }: { text: string }) {
  // renderMarkdown はサニタイズ済みの HTML を返す（生の HTML・スクリプト・危険な URL は除去済み）
  return (
    <div
      className={`${proseClassName} md-note text-[14px]`}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(text) }}
    />
  )
}

export default function ChatSection() {
  const [health, setHealth] = useState<Health | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/chat/health', { cache: 'no-store' })
      .then((res) => (res.ok ? (res.json() as Promise<Health>) : { available: false }))
      .catch(() => ({ available: false }))
      .then((h) => {
        if (!cancelled) setHealth(h)
      })
    return () => {
      cancelled = true
      abortRef.current?.abort()
    }
  }, [])

  useEffect(() => {
    const el = logRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  const send = async (e?: FormEvent) => {
    e?.preventDefault()
    const text = input.trim()
    if (!text || streaming) return
    setError(null)

    // API は履歴を覚えないので、これまでの会話（上限まで）を毎回送る
    const history = [...messages, { role: 'user' as const, content: text }].slice(
      -CHAT_MAX_MESSAGES
    )
    setMessages([...messages, { role: 'user', content: text }, { role: 'assistant', content: '' }])
    setInput('')
    setStreaming(true)

    // 失敗したら、送った発言を入力欄に戻して会話を元に戻す
    const rollback = (message: string) => {
      setMessages((m) => m.slice(0, -2))
      setInput(text)
      setError(message)
    }
    const appendToReply = (delta: string) =>
      setMessages((m) => {
        const last = m.at(-1)
        if (!last || last.role !== 'assistant') return m
        return [...m.slice(0, -1), { ...last, content: last.content + delta }]
      })

    const controller = new AbortController()
    abortRef.current = controller
    let received = false
    let done = false
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      })
      if (!res.ok || !res.body) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null
        if (res.status === 503) setHealth((h) => ({ ...h, available: false }))
        rollback(body?.error ?? 'AIの呼び出しに失敗しました。')
        return
      }
      const read = createSseReader({
        onDelta: (delta) => {
          received = true
          appendToReply(delta)
        },
        onDone: () => {
          done = true
        },
      })
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      while (!done) {
        const { value, done: ended } = await reader.read()
        if (ended) break
        read(decoder.decode(value, { stream: true }))
      }
      if (!done) {
        if (received) setError('返事が途中で途切れました。')
        else rollback('返事が途中で途切れました。もう一度お試しください。')
      }
    } catch (err) {
      if (controller.signal.aborted) {
        // 止めたときは、そこまでの返事を残す（何も届いていなければ取り消す）
        if (!received) rollback('止めました。')
      } else if (received) {
        setError('返事が途中で途切れました。')
      } else {
        rollback(
          err instanceof SyntaxError
            ? 'AIの返事を読み取れませんでした。'
            : 'AIに接続できませんでした。時間をおいてお試しください。'
        )
      }
    } finally {
      abortRef.current = null
      setStreaming(false)
    }
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // 日本語の変換確定の Enter では送らない
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      void send()
    }
  }

  const offline = health !== null && !health.available
  const status =
    health === null
      ? { label: '確認中…', dot: 'bg-ink-600' }
      : health.available
        ? { label: 'オンライン', dot: 'bg-lime-500' }
        : { label: '停止中', dot: 'bg-danger-600' }

  return (
    <section
      id="chat"
      aria-labelledby="chat-title"
      className="scroll-mt-24 px-6 pb-28 sm:px-10 lg:px-20"
    >
      <div className="mx-auto flex max-w-[1100px] flex-col gap-8 lg:flex-row lg:items-start lg:gap-14">
        <div className="flex flex-col gap-4 lg:w-[380px] lg:flex-none">
          <SectionHeader
            eyebrow="AI Chat"
            title={<span id="chat-title">自作のローカルLLMと話す</span>}
            titleClassName="text-[30px] leading-[1.25] sm:text-[40px]"
            description="追加学習したモデルを自宅のPCで動かしています。PCが止まっているときは話せません。"
          />
          <dl className="text-ink-700 flex flex-col gap-1.5 text-xs">
            <div className="flex items-center gap-2">
              <dt className="sr-only">状態</dt>
              <dd className="flex items-center gap-2 font-bold" aria-live="polite">
                <span className={`h-2 w-2 rounded-full ${status.dot}`} aria-hidden="true" />
                {status.label}
              </dd>
            </div>
            {health?.baseModel ? (
              <div className="flex gap-2">
                <dt className="font-bold">モデル</dt>
                <dd>
                  {health.baseModel}
                  {health.adapter ? ` ＋ ${health.adapter}` : ''}
                </dd>
              </div>
            ) : null}
          </dl>
          {/* 注意書きは常に表示する */}
          <p className="bg-brand-100 text-brand-700 rounded-[14px] px-4 py-3 text-xs leading-[1.8] font-bold">
            返事は小さなモデルが生成したもので、間違いを含むことがあります。入力した内容は自宅のPCで動くAPIに送られるので、個人情報や秘密の情報は入力しないでください。
          </p>
        </div>

        <div className="bg-surface-0 border-surface-200 flex min-w-0 flex-1 flex-col overflow-hidden rounded-[28px] border shadow-[var(--shadow-float)]">
          <div
            ref={logRef}
            role="log"
            aria-label="会話"
            aria-busy={streaming}
            className="flex h-[420px] flex-col gap-4 overflow-y-auto px-5 py-6 sm:px-7"
          >
            {messages.length === 0 ? (
              <p className="text-ink-600 m-auto text-center text-sm">
                {offline
                  ? '今はAIが止まっています。時間をおいてお試しください。'
                  : 'メッセージを送ると、AIが返事をします。'}
              </p>
            ) : (
              messages.map((m, i) =>
                m.role === 'user' ? (
                  <div
                    key={i}
                    className="bg-surface-950 text-ink-inverse-50 max-w-[85%] self-end rounded-[18px] rounded-br-md px-4 py-2.5 text-[14px] leading-[1.7] whitespace-pre-wrap"
                  >
                    <span className="sr-only">あなた: </span>
                    {m.content}
                  </div>
                ) : (
                  <div key={i} className="flex max-w-[92%] gap-2.5 self-start">
                    <span
                      className="text-ink-950 mt-1 inline-flex h-7 w-7 flex-none items-center justify-center rounded-full bg-lime-500"
                      aria-hidden="true"
                    >
                      <SparkleIcon size={12} />
                    </span>
                    <div className="bg-brand-100 min-w-0 rounded-[18px] rounded-tl-md px-4 py-1">
                      <span className="sr-only">AI: </span>
                      {m.content ? (
                        <AssistantText text={m.content} />
                      ) : (
                        <p className="text-brand-700 animate-pulse py-2 text-sm font-bold motion-reduce:animate-none">
                          考えています…
                        </p>
                      )}
                    </div>
                  </div>
                )
              )
            )}
          </div>

          <form onSubmit={send} className="border-surface-200 flex flex-col gap-2 border-t p-4">
            {error ? (
              <p role="alert" className="text-danger-600 text-xs font-bold">
                {error}
              </p>
            ) : null}
            <label htmlFor="chat-input" className="sr-only">
              メッセージ
            </label>
            <div className="flex items-end gap-2">
              <textarea
                id="chat-input"
                rows={2}
                maxLength={CHAT_MAX_USER_CHARS}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                disabled={offline}
                placeholder={
                  offline ? 'AIは停止中です' : 'メッセージ（Enterで送信、Shift+Enterで改行）'
                }
                className="border-brand-200 focus:outline-brand-500 min-w-0 flex-1 resize-none rounded-2xl border-[1.5px] bg-white px-4 py-3 text-[14px] leading-[1.6] focus:outline-2 disabled:opacity-60"
              />
              {streaming ? (
                <button
                  type="button"
                  onClick={() => abortRef.current?.abort()}
                  className="border-ink-950 text-ink-950 flex-none rounded-full border-[1.5px] px-5 py-3 text-[13px] font-bold"
                >
                  止める
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={offline || !input.trim()}
                  className="text-ink-950 flex-none rounded-full bg-lime-500 px-5 py-3 text-[13px] font-bold disabled:opacity-50"
                >
                  送信
                </button>
              )}
            </div>
            {messages.length > 0 && !streaming ? (
              <button
                type="button"
                onClick={() => {
                  setMessages([])
                  setError(null)
                }}
                className="text-ink-600 self-start text-xs font-bold underline"
              >
                会話をリセット
              </button>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  )
}
