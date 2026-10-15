import type { AsyncBatchRemoteCallback, AsyncRemoteCallback } from 'drizzle-orm/sqlite-proxy'

// Cloudflare D1 の REST API（/raw）を Drizzle の sqlite-proxy から呼ぶためのアダプタ
// Vercel からは Workers バインディングが使えないため HTTP 経由で接続する

type D1Config = { accountId: string; databaseId: string; token: string }

type RawResult = {
  results?: { columns: string[]; rows: unknown[][] }
  success: boolean
}

type ApiResponse = {
  success: boolean
  errors?: { code: number; message: string }[]
  result?: RawResult[]
}

type Method = 'run' | 'all' | 'values' | 'get'

const TIMEOUT_MS = 10_000

export function createD1HttpCallbacks(config: D1Config): {
  query: AsyncRemoteCallback
  batch: AsyncBatchRemoteCallback
} {
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/d1/database/${config.databaseId}/raw`

  async function post(body: unknown): Promise<RawResult[]> {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    const json = (await res.json().catch(() => null)) as ApiResponse | null
    if (!res.ok || !json?.success || !json.result) {
      const message =
        json?.errors?.map((e) => `${e.code}: ${e.message}`).join(', ') || `HTTP ${res.status}`
      throw new Error(`D1 query failed (${message})`)
    }
    return json.result
  }

  function toRows(result: RawResult, method: Method) {
    const rows = result.results?.rows ?? []
    if (method === 'run') return { rows: [] }
    if (method === 'get') return { rows: rows[0] ?? [] }
    return { rows }
  }

  return {
    query: async (sql, params, method) => {
      const [result] = await post({ sql, params })
      return toRows(result, method)
    },
    // D1 はインタラクティブなトランザクションを持たないため、複数文はバッチで送る
    batch: async (queries) => {
      const results = await post({ batch: queries.map(({ sql, params }) => ({ sql, params })) })
      return results.map((r, i) => toRows(r, queries[i].method))
    },
  }
}
