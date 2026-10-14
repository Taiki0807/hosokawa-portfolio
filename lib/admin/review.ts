import 'server-only'
import { and, desc, eq, ne } from 'drizzle-orm'
import { getDb } from '@/lib/db/client'
import { learningEntries, reviewComments, type ReviewPersona } from '@/lib/db/schema'
import { readPublicLearningData } from '@/lib/learning/queries'
import { addDays, todayJst } from '@/lib/learning/date'
import { computeStats, minutesToHours } from '@/lib/learning/stats'
import { tagTotals } from '@/lib/learning/topics'
import { getMergedPosts, getMergedProjects } from '@/lib/posts'
import type { ReviewContext } from '@/lib/ai/generate-review'

const NOTE_COUNT = 5
const NOTE_EXCERPT = 1200

/** AI に渡すのは集計・直近の詳細ノート・成果物の説明文だけ（メールや問い合わせは含めない） */
export async function buildReviewContext(): Promise<ReviewContext> {
  const today = todayJst()
  const from = addDays(today, -364)
  const db = getDb()
  const [learning, noteRows, projects, blog] = await Promise.all([
    readPublicLearningData(),
    db
      .select({
        date: learningEntries.date,
        title: learningEntries.title,
        noteMd: learningEntries.noteMd,
      })
      .from(learningEntries)
      .where(and(eq(learningEntries.status, 'published'), ne(learningEntries.noteMd, '')))
      .orderBy(desc(learningEntries.date))
      .limit(NOTE_COUNT),
    getMergedProjects(),
    getMergedPosts(),
  ])
  const stats = computeStats(learning.days, today, from)
  return {
    period: { from, to: today },
    stats: {
      studyDays: stats.studyDays,
      totalHours: minutesToHours(stats.totalMinutes),
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      entryCount: learning.days.filter((d) => d.date >= from).length,
    },
    tagHours: tagTotals(learning.sessions, from, today)
      .slice(0, 12)
      .map((t) => ({ tag: t.tag, hours: minutesToHours(t.minutes) })),
    notes: noteRows.map((n) => ({
      date: n.date,
      title: n.title,
      excerpt: n.noteMd.slice(0, NOTE_EXCERPT),
    })),
    works: [
      ...projects.map((p) => ({
        kind: 'project',
        title: p.title,
        description: p.description,
        href: `/projects/${p.slug}`,
      })),
      ...blog.map((p) => ({
        kind: 'blog',
        title: p.title,
        description: p.excerpt ?? '',
        href: `/blog/${p.slug}`,
      })),
    ],
  }
}

export async function getReviewState(persona: ReviewPersona) {
  const db = getDb()
  const rows = await db
    .select()
    .from(reviewComments)
    .where(eq(reviewComments.persona, persona))
    .orderBy(desc(reviewComments.generatedAt), reviewComments.sort)
  const latestBatch = rows[0]?.batchId
  return {
    drafts: rows.filter((r) => r.batchId === latestBatch),
    published: rows.filter((r) => r.published),
  }
}

export async function getReviewHistory() {
  const rows = await getDb()
    .select({
      batchId: reviewComments.batchId,
      persona: reviewComments.persona,
      generatedAt: reviewComments.generatedAt,
      published: reviewComments.published,
    })
    .from(reviewComments)
    .orderBy(desc(reviewComments.generatedAt))
  const map = new Map<
    string,
    { batchId: string; persona: ReviewPersona; generatedAt: string; published: boolean }
  >()
  for (const r of rows) {
    const cur = map.get(r.batchId)
    if (!cur) map.set(r.batchId, { ...r })
    else if (r.published) cur.published = true
  }
  return [...map.values()].slice(0, 12)
}
