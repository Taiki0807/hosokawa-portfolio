// 開発用のダミーデータ。ローカル SQLite 専用で、アプリのコードからは import しない（本番ビルドに含めない）
// 数字・文章・資格名はすべてサンプル。本番の値は管理画面から入力する
import { drizzle } from 'drizzle-orm/sqlite-proxy'
import * as schema from '../lib/db/schema'
import { createLocalCallbacks, openLocalSqlite } from '../lib/db/local'
import { addDays, todayJst } from '../lib/learning/date'

if ((process.env.DB_DRIVER ?? 'local') !== 'local') {
  console.error('seed はローカル SQLite（DB_DRIVER=local）でのみ実行できます')
  process.exit(1)
}

const sqlite = openLocalSqlite()
const { query, batch } = createLocalCallbacks(sqlite)
const db = drizzle(query, batch, { schema })

// 再現性のある乱数
let state = 20261015
const rand = () => (state = (state * 1103515245 + 12345) % 2 ** 31) / 2 ** 31
const pick = <T>(xs: readonly T[]) => xs[Math.floor(rand() * xs.length)]

const TOPICS: Record<string, string[]> = {
  'Next.js': [
    'App RouterのServer Componentsの境界を確認した',
    'revalidateによるキャッシュ戦略を検証した',
  ],
  TypeScript: ['ジェネリクスの制約を使って型を絞り込んだ', 'satisfiesとasの違いを整理した'],
  AWS: ['VPCとサブネットの設計を見直した', 'CloudFormationでスタックを分割した'],
  GCP: ['サービスアカウントとIAMの違いを整理した', 'Cloud Runにデプロイした'],
  Terraform: ['モジュールに分けて環境ごとに再利用した', 'tfstateをリモートで管理した'],
  Docker: ['マルチステージビルドでイメージを軽くした'],
  アルゴリズム: ['動的計画法の典型問題を3問解いた', '二分探索の境界条件を確認した'],
  資格対策: ['模擬試験を1回解いて、間違えた問題を復習した'],
}
const TAGS = Object.keys(TOPICS)

async function main() {
  const today = todayJst()
  await db.batch([
    db.delete(schema.learningSessions),
    db.delete(schema.learningEntries),
    db.delete(schema.goals),
    db.delete(schema.certTargets),
    db.delete(schema.reviewComments),
  ])

  for (let i = 365; i >= 1; i--) {
    if (rand() < 0.4) continue
    const date = addDays(today, -i)
    const count = rand() < 0.3 ? 2 : 1
    const sessions = Array.from({ length: count }, () => {
      const tag = pick(TAGS)
      return { tag, memo: pick(TOPICS[tag]), minutes: pick([15, 25, 30, 45, 60, 90, 120]) }
    })
    const [entry] = await db
      .insert(schema.learningEntries)
      .values({
        date,
        title: `${sessions.map((s) => s.tag).join('・')}の学習`,
        status: rand() < 0.08 ? 'private' : 'published',
        reportText: `[サンプル] ${sessions.map((s) => s.memo).join('。')}。`,
        reportAiPolished: rand() < 0.5,
        noteMd:
          rand() < 0.2
            ? `## 学んだこと\n\n[サンプル] ${sessions[0].memo}。\n\n\`\`\`ts\nconst sample = true\n\`\`\`\n`
            : '',
      })
      .returning({ id: schema.learningEntries.id })
    await db
      .insert(schema.learningSessions)
      .values(sessions.map((s, sort) => ({ ...s, entryId: entry.id, sort })))
  }

  const year = today.slice(0, 4)
  const month = today.slice(0, 7)
  await db.insert(schema.goals).values([
    {
      kind: 'yearly',
      period: year,
      label: '[サンプル] 学習した日を250日にする',
      target: 250,
      unit: '日',
      source: 'auto:studyDays',
      sort: 0,
    },
    {
      kind: 'yearly',
      period: year,
      label: '[サンプル] ブログ記事を12本書く',
      target: 12,
      unit: '本',
      source: 'manual',
      manualValue: 3,
      sort: 1,
    },
    {
      kind: 'monthly',
      period: month,
      label: '[サンプル] 20日以上学習する',
      target: 20,
      unit: '日',
      source: 'auto:studyDays',
      sort: 0,
    },
    {
      kind: 'monthly',
      period: month,
      label: '[サンプル] 学習時間を30時間にする',
      target: 30,
      unit: 'h',
      source: 'auto:studyHours',
      sort: 1,
    },
  ])
  await db.insert(schema.certTargets).values([
    {
      name: '[サンプル] Certified Solutions Architect – Professional',
      issuer: 'AWS',
      examDate: addDays(today, 101),
      studyTags: ['AWS', '資格対策'],
      targetHours: 120,
      currentFocus: 'ネットワーク分野の復習',
      isNowStudying: true,
      sort: 0,
    },
    {
      name: '[サンプル] Professional Cloud Developer',
      issuer: 'Google Cloud',
      examDate: addDays(today, 150),
      progressMode: 'manual',
      manualProgress: 10,
      studyTags: ['GCP'],
      sort: 1,
    },
  ])
  const batchId = 'seed'
  await db.insert(schema.reviewComments).values([
    {
      persona: 'boss',
      tag: '強み',
      title: '[サンプル] 毎日、手を止めない継続力',
      text: 'サンプルのコメントです。',
      evidence: [{ label: '学習ログ', href: '/#learning' }],
      published: true,
      publishedAt: new Date().toISOString(),
      batchId,
      sort: 0,
    },
    {
      persona: 'boss',
      tag: '期待',
      title: '[サンプル] 学んだことを人に説明する場面をもっと',
      text: 'サンプルのコメントです。',
      evidence: [],
      published: true,
      publishedAt: new Date().toISOString(),
      batchId,
      sort: 1,
    },
    {
      persona: 'tech',
      tag: '技術',
      title: '[サンプル] 再現性と運用を意識したインフラ',
      text: 'サンプルのコメントです。',
      evidence: [{ label: '学習トピック', href: '/#learning' }],
      published: true,
      publishedAt: new Date().toISOString(),
      batchId,
      sort: 0,
    },
    {
      persona: 'tech',
      tag: '期待',
      title: '[サンプル] テスト・監視の記録を増やす',
      text: 'サンプルのコメントです。',
      evidence: [],
      published: true,
      publishedAt: new Date().toISOString(),
      batchId,
      sort: 1,
    },
  ])
  console.log('Seeded sample data into the local database')
}

main().finally(() => sqlite.close())
