import { asc } from 'drizzle-orm'
import { adminRoute } from '@/lib/http/admin-route'
import { getDb } from '@/lib/db/client'
import { learningEntries, learningSessions } from '@/lib/db/schema'
import { todayJst } from '@/lib/learning/date'

export const GET = adminRoute(async (_owner, request: Request) => {
  const format = new URL(request.url).searchParams.get('format') === 'md' ? 'md' : 'json'
  const db = getDb()
  const [entries, sessions] = await db.batch([
    db.select().from(learningEntries).orderBy(asc(learningEntries.date)),
    db
      .select()
      .from(learningSessions)
      .orderBy(asc(learningSessions.entryId), asc(learningSessions.sort)),
  ])
  const data = entries.map((e) => ({
    ...e,
    sessions: sessions
      .filter((s) => s.entryId === e.id)
      .map(({ tag, minutes, memo }) => ({ tag, minutes, memo })),
  }))
  const filename = `learning-log-${todayJst()}.${format === 'md' ? 'md' : 'json'}`
  const headers = {
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Cache-Control': 'no-store',
  }

  if (format === 'json') {
    return new Response(
      JSON.stringify({ exportedAt: new Date().toISOString(), entries: data }, null, 2),
      {
        headers: { ...headers, 'Content-Type': 'application/json; charset=utf-8' },
      }
    )
  }
  const md = data
    .map((e) =>
      [
        `## ${e.date} ${e.title}`.trim(),
        '',
        `- 状態: ${e.status}${e.reportAiPolished ? '（レポートはAI整形）' : ''}`,
        ...e.sessions.map((s) => `- [${s.tag}] ${s.minutes}分 ${s.memo}`.trimEnd()),
        ...(e.reportText ? ['', '### 学習レポート', '', e.reportText] : []),
        ...(e.noteMd ? ['', '### 詳細ノート', '', e.noteMd] : []),
        '',
      ].join('\n')
    )
    .join('\n')
  return new Response(`# 学習ログ（${todayJst()} 時点）\n\n${md}`, {
    headers: { ...headers, 'Content-Type': 'text/markdown; charset=utf-8' },
  })
})
