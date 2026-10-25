import { NextResponse } from 'next/server'
import { localLlmBaseUrl } from '@/lib/local-llm/server'

const HEALTH_TIMEOUT_MS = 5_000

type Health = { available: boolean; baseModel?: string; adapter?: string | null }

/** チャット欄の「話せる / 止まっている」の表示用。ローカル LLM の /health を中継する */
export async function GET() {
  const base = localLlmBaseUrl()
  const body: Health = { available: false }
  if (base) {
    try {
      const res = await fetch(`${base}/health`, {
        signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS),
        cache: 'no-store',
      })
      if (res.ok) {
        const h = (await res.json()) as {
          loaded?: unknown
          training?: unknown
          base_model?: unknown
          adapter?: unknown
        }
        body.available = h.loaded === true && h.training !== true
        if (typeof h.base_model === 'string') body.baseModel = h.base_model
        if (typeof h.adapter === 'string' || h.adapter === null) body.adapter = h.adapter
      }
    } catch {
      // 止まっている・つながらないときは available: false のまま
    }
  }
  return NextResponse.json(body, { headers: { 'Cache-Control': 'no-store' } })
}
