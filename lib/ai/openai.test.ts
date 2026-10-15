import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { openaiProvider } from './openai'

// OpenAI には接続せず、fetch を差し替えて Responses API の応答を返す
function respond(body: object, status = 200) {
  const fetchMock = vi.fn<typeof fetch>(
    async () =>
      new Response(JSON.stringify(body), {
        status,
        headers: { 'content-type': 'application/json' },
      })
  )
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function message(content: object[], extra: object = {}) {
  return {
    id: 'resp_1',
    object: 'response',
    status: 'completed',
    incomplete_details: null,
    output: [{ type: 'message', id: 'msg_1', role: 'assistant', status: 'completed', content }],
    ...extra,
  }
}

const text = (t: string) => ({ type: 'output_text', text: t, annotations: [] })
const req = { system: 'sys', prompt: 'hello', maxTokens: 100 }

beforeEach(() => {
  vi.stubEnv('OPENAI_API_KEY', 'sk-test')
  vi.stubEnv('OPENAI_MODEL', 'test-model')
  vi.stubEnv('OPENAI_REASONING_EFFORT', '')
})
afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('openaiProvider', () => {
  it('文章を返し、学習ログを OpenAI 側に保存させない', async () => {
    const fetchMock = respond(message([text('  整えた文章  ')]))
    await expect(openaiProvider.generateText(req)).resolves.toBe('整えた文章')
    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toContain('/responses')
    const body = JSON.parse(String(init?.body))
    expect(body).toMatchObject({
      model: 'test-model',
      instructions: 'sys',
      input: 'hello',
      store: false,
    })
    expect(body.reasoning).toBeUndefined()
  })

  it('OPENAI_REASONING_EFFORT を指定したときだけ渡す', async () => {
    vi.stubEnv('OPENAI_REASONING_EFFORT', 'low')
    const fetchMock = respond(message([text('ok')]))
    await openaiProvider.generateText(req)
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body)).reasoning).toEqual({
      effort: 'low',
    })
  })

  it('断られたら refused', async () => {
    respond(message([{ type: 'refusal', refusal: 'no' }]))
    await expect(openaiProvider.generateText(req)).rejects.toMatchObject({ code: 'refused' })
  })

  it('途中で終わったら invalid_output', async () => {
    respond(
      message([text('途中')], {
        status: 'incomplete',
        incomplete_details: { reason: 'max_output_tokens' },
      })
    )
    await expect(openaiProvider.generateText(req)).rejects.toMatchObject({ code: 'invalid_output' })
  })

  it('JSON をスキーマで検証して返す', async () => {
    const schema = z.object({ items: z.array(z.string().min(1)).min(1) })
    const fetchMock = respond(message([text(JSON.stringify({ items: ['a'] }))]))
    await expect(openaiProvider.generateJson({ ...req, schema })).resolves.toEqual({ items: ['a'] })
    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body))
    expect(body.text.format).toMatchObject({ type: 'json_schema', strict: true })
  })

  it('スキーマに合わない JSON は invalid_output', async () => {
    const schema = z.object({ items: z.array(z.string().min(1)).min(1) })
    respond(message([text(JSON.stringify({ items: [] }))]))
    await expect(openaiProvider.generateJson({ ...req, schema })).rejects.toMatchObject({
      code: 'invalid_output',
    })
  })

  it('キーやモデルがなければ not_configured', async () => {
    vi.stubEnv('OPENAI_MODEL', '')
    await expect(openaiProvider.generateText(req)).rejects.toMatchObject({ code: 'not_configured' })
    vi.stubEnv('OPENAI_API_KEY', '')
    vi.stubEnv('OPENAI_MODEL', 'test-model')
    await expect(openaiProvider.generateText(req)).rejects.toMatchObject({ code: 'not_configured' })
  })

  it('API キーが違えば not_configured', async () => {
    respond({ error: { message: 'bad key', type: 'invalid_request_error' } }, 401)
    await expect(openaiProvider.generateText(req)).rejects.toMatchObject({ code: 'not_configured' })
  })
})
