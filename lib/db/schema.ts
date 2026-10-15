import { sql } from 'drizzle-orm'
import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core'

// D1 は SQLite のため、日付は 'YYYY-MM-DD'、日時は ISO 文字列、配列・オブジェクトは JSON 文字列で保持する

const now = () => new Date().toISOString()
const timestamps = {
  createdAt: text('created_at').notNull().$defaultFn(now),
  updatedAt: text('updated_at').notNull().$defaultFn(now).$onUpdateFn(now),
}

// ============================================
// 学習ログ
// ============================================

export const ENTRY_STATUSES = ['draft', 'published', 'private'] as const
export type EntryStatus = (typeof ENTRY_STATUSES)[number]

export const learningEntries = sqliteTable(
  'learning_entry',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    // JST の日付（YYYY-MM-DD）。1日1件
    date: text('date').notNull(),
    title: text('title').notNull().default(''),
    status: text('status').$type<EntryStatus>().notNull().default('draft'),
    reportText: text('report_text').notNull().default(''),
    reportAiPolished: integer('report_ai_polished', { mode: 'boolean' }).notNull().default(false),
    noteMd: text('note_md').notNull().default(''),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('learning_entry_date_uq').on(t.date),
    index('learning_entry_status_idx').on(t.status),
  ]
)

export const learningSessions = sqliteTable(
  'learning_session',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    entryId: integer('entry_id')
      .notNull()
      .references(() => learningEntries.id, { onDelete: 'cascade' }),
    tag: text('tag').notNull(),
    memo: text('memo').notNull().default(''),
    minutes: integer('minutes').notNull(),
    sort: integer('sort').notNull().default(0),
  },
  (t) => [index('learning_session_entry_idx').on(t.entryId)]
)

// ============================================
// 目標と挑戦中の資格
// ============================================

export const GOAL_KINDS = ['yearly', 'monthly'] as const
export const GOAL_SOURCES = ['auto:studyDays', 'auto:studyHours', 'manual'] as const
export type GoalKind = (typeof GOAL_KINDS)[number]
export type GoalSource = (typeof GOAL_SOURCES)[number]

export const goals = sqliteTable('goal', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  kind: text('kind').$type<GoalKind>().notNull(),
  // yearly: 'YYYY' / monthly: 'YYYY-MM'
  period: text('period').notNull(),
  label: text('label').notNull(),
  target: real('target').notNull(),
  unit: text('unit').notNull().default(''),
  source: text('source').$type<GoalSource>().notNull().default('manual'),
  manualValue: real('manual_value'),
  // 自動で数えるときの対象タグ。空なら全部のタグ
  studyTags: text('study_tags', { mode: 'json' })
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'`),
  note: text('note').notNull().default(''),
  sort: integer('sort').notNull().default(0),
  ...timestamps,
})

export const certTargets = sqliteTable('cert_target', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  issuer: text('issuer').notNull().default(''),
  examDate: text('exam_date'),
  progressMode: text('progress_mode').$type<'auto' | 'manual'>().notNull().default('auto'),
  manualProgress: integer('manual_progress'),
  studyTags: text('study_tags', { mode: 'json' })
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'`),
  targetHours: real('target_hours'),
  currentFocus: text('current_focus').notNull().default(''),
  isNowStudying: integer('is_now_studying', { mode: 'boolean' }).notNull().default(false),
  sort: integer('sort').notNull().default(0),
  ...timestamps,
})

// ============================================
// 第三者の目線レビュー
// ============================================

export const REVIEW_PERSONAS = ['boss', 'tech', 'peer', 'hr'] as const
export const REVIEW_TAGS = ['強み', '期待', '技術'] as const
export type ReviewPersona = (typeof REVIEW_PERSONAS)[number]
export type ReviewTag = (typeof REVIEW_TAGS)[number]
export type Evidence = { label: string; href: string }

export const reviewComments = sqliteTable(
  'review_comment',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    persona: text('persona').$type<ReviewPersona>().notNull(),
    tag: text('tag').$type<ReviewTag>().notNull(),
    title: text('title').notNull(),
    text: text('text').notNull(),
    evidence: text('evidence', { mode: 'json' })
      .$type<Evidence[]>()
      .notNull()
      .default(sql`'[]'`),
    published: integer('published', { mode: 'boolean' }).notNull().default(false),
    sort: integer('sort').notNull().default(0),
    generatedAt: text('generated_at').notNull().$defaultFn(now),
    publishedAt: text('published_at'),
    batchId: text('batch_id').notNull(),
  },
  (t) => [index('review_comment_persona_idx').on(t.persona, t.published)]
)

// ============================================
// スキル・取得済み資格（data.ts から移行）
// ============================================

export const SKILL_CATEGORIES = ['core', 'experience', 'learning'] as const
export type SkillCategory = (typeof SKILL_CATEGORIES)[number]

export const skills = sqliteTable('skill', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  // core: コア / experience: 業務経験あり / learning: 学習中
  category: text('category').$type<SkillCategory>().notNull(),
  // 本人のみが知る値。未設定は null
  years: real('years'),
  description: text('description').notNull().default(''),
  sort: integer('sort').notNull().default(0),
  ...timestamps,
})

export const certifications = sqliteTable('certification', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  issuer: text('issuer').notNull().default(''),
  // 'YYYY-MM' または 'YYYY-MM-DD'
  earnedOn: text('earned_on'),
  expiresOn: text('expires_on'),
  badgeUrl: text('badge_url'),
  credentialUrl: text('credential_url'),
  sort: integer('sort').notNull().default(0),
  ...timestamps,
})

// ============================================
// 管理画面から書く記事（既存 MDX と並べて表示）
// ============================================

export const POST_KINDS = ['blog', 'css-note', 'project'] as const
export type PostKind = (typeof POST_KINDS)[number]

export const posts = sqliteTable(
  'post',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    kind: text('kind').$type<PostKind>().notNull(),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    category: text('category').notNull().default(''),
    excerpt: text('excerpt').notNull().default(''),
    tags: text('tags', { mode: 'json' })
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'`),
    bodyMd: text('body_md').notNull().default(''),
    // 外部サイトなどへのリンク（MDX の frontmatter の link に相当）。空ならボタンを出さない
    linkLabel: text('link_label').notNull().default(''),
    linkHref: text('link_href').notNull().default(''),
    status: text('status').$type<'draft' | 'published'>().notNull().default('draft'),
    publishedAt: text('published_at'),
    ...timestamps,
  },
  (t) => [uniqueIndex('post_kind_slug_uq').on(t.kind, t.slug)]
)

// ============================================
// お問い合わせ
// ============================================

export const contactMessages = sqliteTable(
  'contact_message',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    email: text('email').notNull(),
    subject: text('subject').notNull(),
    message: text('message').notNull(),
    status: text('status').$type<'open' | 'done' | 'spam'>().notNull().default('open'),
    mailStatus: text('mail_status')
      .$type<'pending' | 'sent' | 'failed'>()
      .notNull()
      .default('pending'),
    mailError: text('mail_error'),
    ...timestamps,
  },
  (t) => [index('contact_message_status_idx').on(t.status)]
)

// ============================================
// 設定・レート制限
// ============================================

export const siteSettings = sqliteTable('site_setting', {
  key: text('key').primaryKey(),
  value: text('value', { mode: 'json' }).notNull(),
  updatedAt: text('updated_at').notNull().$defaultFn(now).$onUpdateFn(now),
})

export const rateLimits = sqliteTable(
  'rate_limit',
  {
    key: text('key').notNull(),
    windowStart: integer('window_start').notNull(),
    count: integer('count').notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.key, t.windowStart] })]
)
