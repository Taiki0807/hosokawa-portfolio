import { z } from 'zod'
import { GOAL_KINDS, GOAL_SOURCES } from '@/lib/db/schema'
import { isIsoDate } from '@/lib/learning/date'

const optionalNumber = z.preprocess(
  (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
  z.number().finite().nullable()
)

export const certTargetInputSchema = z.object({
  name: z.string().trim().min(1, '資格名を入力してください').max(120),
  issuer: z.string().trim().max(60).default(''),
  examDate: z
    .string()
    .trim()
    .default('')
    .refine((v) => v === '' || isIsoDate(v), '日付を YYYY-MM-DD で入力してください')
    .transform((v) => v || null),
  progressMode: z.enum(['auto', 'manual']),
  manualProgress: optionalNumber.refine(
    (v) => v == null || (v >= 0 && v <= 100),
    '0〜100 で入力してください'
  ),
  studyTags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  targetHours: optionalNumber.refine((v) => v == null || v > 0, '0より大きい値を入力してください'),
  currentFocus: z.string().trim().max(60).default(''),
  isNowStudying: z.boolean().default(false),
})

export const goalInputSchema = z
  .object({
    kind: z.enum(GOAL_KINDS),
    period: z.string().trim(),
    label: z.string().trim().min(1, '項目を入力してください').max(80),
    target: z.coerce.number().positive('目標は0より大きい値にしてください'),
    unit: z.string().trim().max(10).default(''),
    source: z.enum(GOAL_SOURCES),
    manualValue: optionalNumber,
    note: z.string().trim().max(80).default(''),
  })
  .refine(
    (g) =>
      g.kind === 'yearly' ? /^\d{4}$/.test(g.period) : /^\d{4}-(0[1-9]|1[0-2])$/.test(g.period),
    {
      message: '期間は年なら YYYY、月なら YYYY-MM で入力してください',
      path: ['period'],
    }
  )

export const goalsFormSchema = z
  .object({
    certTargets: z.array(certTargetInputSchema).max(10),
    goals: z.array(goalInputSchema).max(30),
  })
  .refine((v) => v.certTargets.filter((c) => c.isNowStudying).length <= 1, {
    message: '「NOW STUDYING」にできる資格は1つだけです',
    path: ['certTargets'],
  })

export type GoalsFormInput = z.input<typeof goalsFormSchema>
