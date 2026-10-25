// e2e 用のローカル LLM のモック（/health と、SSE で返す /chat）
import http from 'node:http'

const PORT = Number(process.env.MOCK_LLM_PORT ?? 3201)

http
  .createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(
        JSON.stringify({ loaded: true, base_model: 'mock-base', adapter: 'mock', training: false })
      )
      return
    }
    if (req.method === 'POST' && req.url === '/chat') {
      let raw = ''
      req.on('data', (c) => (raw += c))
      req.on('end', () => {
        const { messages } = JSON.parse(raw)
        const last = messages.at(-1).content
        res.writeHead(200, { 'Content-Type': 'text/event-stream' })
        // 受け取った履歴の件数と先頭の role を返事に含め、サーバーが付けた system を確かめられるようにする
        const parts = [
          `**${last}**`,
          ` を受け取りました（${messages.length}件、`,
          `先頭は ${messages[0].role}）`,
        ]
        for (const delta of parts) res.write(`data: ${JSON.stringify({ delta })}\n\n`)
        res.end('data: [DONE]\n\n')
      })
      return
    }
    res.writeHead(404).end()
  })
  .listen(PORT)
