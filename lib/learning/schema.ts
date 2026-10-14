import { z } from 'zod'
import { isIsoDate } from './date'

// 記録フォームの入力。クライアントとサーバーの両方で使う（サーバー側で必ず再検証する）

export const MAX_DAY_MINUTES = 24 * 60

export const sessionInputSchema = z.object({
  tag: z.string().trim().min(1, 'タグを入力してください').max(40, 'タグは40文字以内にしてください'),
  minutes: z.coerce
    .number()
    .int('分は整数で入力してください')
    .min(1, '1分以上を入力してください')
    .max(MAX_DAY_MINUTES, '1日の分数を超えています'),
  memo: z.string().trim().max(500, 'メモは500文字以内にしてください').default(''),
})

export const entryInputSchema = z
  .object({
    id: z.number().int().positive().optional(),
    date: z.string().refine(isIsoDate, '日付を YYYY-MM-DD で入力してください'),
    title: z.string().trim().max(120, 'タイトルは120文字以内にしてください').default(''),
    sessions: z.array(sessionInputSchema).min(1, '学習を1つ以上入力してください').max(10),
    noteMd: z.string().max(20000, '詳細ノートが長すぎます').default(''),
    reportText: z.string().trim().max(4000, 'レポートが長すぎます').default(''),
    reportAiPolished: z.boolean().default(false),
    /** 公開範囲：内容まで公開 / 時間だけ公開 */
    visibility: z.enum(['published', 'private']).default('published'),
    /** draft: 下書き保存 / publish: 公開する */
    intent: z.enum(['draft', 'publish']),
    /** AI が整えた文章を本人が読んで確認したか（公開前の確認は必須で、設定で外せない） */
    aiConfirmed: z.boolean().default(false),
  })
  .refine((v) => v.sessions.reduce((s, x) => s + x.minutes, 0) <= MAX_DAY_MINUTES, {
    message: '1日の合計が24時間を超えています',
    path: ['sessions'],
  })

export type EntryInput = z.input<typeof entryInputSchema>
export type EntryParsed = z.output<typeof entryInputSchema>

/** 保存後の状態を決める。AI 整形した文章は、本人の確認がなければ公開しない */
export function resolveEntryStatus(
  input: Pick<
    EntryParsed,
    'intent' | 'visibility' | 'reportAiPolished' | 'aiConfirmed' | 'reportText'
  >,
  publishOnSave: boolean
): { status: 'draft' | 'published' | 'private'; blockedByReview: boolean } {
  const wantsPublish = input.intent === 'publish' || publishOnSave
  if (!wantsPublish) return { status: 'draft', blockedByReview: false }
  const needsReview = input.reportAiPolished && input.reportText.length > 0 && !input.aiConfirmed
  if (needsReview) return { status: 'draft', blockedByReview: input.intent === 'publish' }
  return { status: input.visibility, blockedByReview: false }
}
