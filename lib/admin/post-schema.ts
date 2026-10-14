import { z } from 'zod'
import { POST_KINDS } from '@/lib/db/schema'

export const postInputSchema = z.object({
  id: z.number().int().positive().optional(),
  kind: z.enum(POST_KINDS),
  slug: z
    .string()
    .trim()
    .min(1, 'スラッグを入力してください')
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'スラッグは半角英小文字・数字・ハイフンにしてください'),
  title: z.string().trim().min(1, 'タイトルを入力してください').max(120),
  category: z.string().trim().max(40).default(''),
  excerpt: z.string().trim().max(300).default(''),
  tags: z.array(z.string().trim().min(1).max(30)).max(10).default([]),
  bodyMd: z.string().max(50000, '本文が長すぎます').default(''),
  intent: z.enum(['draft', 'publish']),
})

export type PostInput = z.input<typeof postInputSchema>
