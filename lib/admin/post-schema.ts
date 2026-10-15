import { z } from 'zod'
import { POST_KINDS } from '@/lib/db/schema'

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** 入力中の値をスラッグの形に寄せる（大文字→小文字、空白・_→-）。URL のような値はそのまま返す */
export function normalizeSlug(v: string) {
  if (/[/:.]/.test(v)) return v
  return v
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
}

/** アイコンが画像（URL・サイト内のパス）か。違えば絵文字として扱う */
export function isImageIcon(v: string) {
  return /^https:\/\//.test(v) || (v.startsWith('/') && !v.startsWith('//'))
}

/** リンク先は http(s) の URL か、サイト内のパス（/ で始まる。// は不可）だけ */
export function isAllowedLinkHref(v: string) {
  if (v.startsWith('/')) return !v.startsWith('//')
  try {
    const u = new URL(v)
    return u.protocol === 'https:' || u.protocol === 'http:'
  } catch {
    return false
  }
}

export const postInputSchema = z
  .object({
    id: z.number().int().positive().optional(),
    kind: z.enum(POST_KINDS),
    slug: z
      .string()
      .trim()
      .min(1, 'スラッグを入力してください')
      .max(80)
      .refine(
        (v) => !/^https?:\/\//i.test(v),
        'ここにはサイトの URL ではなく、このページの URL 名（例: tsumi-note）を入れます。外部サイトのリンクは「リンク」欄に入れてください'
      )
      .refine(
        (v) => /^https?:\/\//i.test(v) || SLUG_PATTERN.test(v),
        'URL 名は半角英小文字・数字・ハイフンにしてください（例: tsumi-note）'
      ),
    title: z.string().trim().min(1, 'タイトルを入力してください').max(120),
    category: z.string().trim().max(40).default(''),
    excerpt: z.string().trim().max(300).default(''),
    tags: z.array(z.string().trim().min(1).max(30)).max(10).default([]),
    bodyMd: z.string().max(50000, '本文が長すぎます').default(''),
    linkLabel: z.string().trim().max(30).default(''),
    linkHref: z
      .string()
      .trim()
      .max(500)
      .default('')
      .refine(
        (v) => v === '' || isAllowedLinkHref(v),
        'https:// で始まる URL か、/ で始まるサイト内のパスを入れてください'
      ),
    icon: z
      .string()
      .trim()
      .max(300)
      .default('')
      .refine(
        (v) => v === '' || isImageIcon(v) || (Array.from(v).length <= 4 && !/[\s<>]/.test(v)),
        'アイコンは画像をアップロードするか、絵文字 1 つを入れてください'
      ),
    intent: z.enum(['draft', 'publish']),
  })
  // URL だけ入れたときのボタンの文字
  .transform((v) => ({
    ...v,
    linkLabel: v.linkHref && !v.linkLabel ? 'サイトを見る' : v.linkLabel,
  }))

export type PostInput = z.input<typeof postInputSchema>
