import 'server-only'
import { eq } from 'drizzle-orm'
import { getDb } from '@/lib/db/client'
import { contactMessages } from '@/lib/db/schema'
import { hitRateLimit } from '@/lib/rate-limit'
import { contactInputSchema } from './schema'
import { sendContactNotification } from './notify'

export const CONTACT_RATE_LIMIT = { limit: 5, windowSeconds: 60 * 60 }

export type SubmitResult =
  | { status: 200; body: { success: true } }
  | { status: 400 | 429 | 500; body: { error: string } }

/** お問い合わせを受け付ける：検証 → レート制限 → D1 に保存 → 通知メール（失敗しても保存は成功扱い） */
export async function submitContact(
  raw: unknown,
  clientKey: string,
  notify = sendContactNotification
): Promise<SubmitResult> {
  const parsed = contactInputSchema.safeParse(raw)
  if (!parsed.success)
    return { status: 400, body: { error: '全ての項目を正しく入力してください。' } }
  const input = parsed.data

  // ハニーポットに入力がある = ボット。保存も通知もせず、成功したように見せる
  if (input.website) return { status: 200, body: { success: true } }

  if (
    !(await hitRateLimit(
      `contact:${clientKey}`,
      CONTACT_RATE_LIMIT.limit,
      CONTACT_RATE_LIMIT.windowSeconds
    ))
  ) {
    return {
      status: 429,
      body: { error: '送信回数が多すぎます。時間をおいて再度お試しください。' },
    }
  }

  const db = getDb()
  const [row] = await db
    .insert(contactMessages)
    .values({
      name: input.name,
      email: input.email,
      subject: input.subject,
      message: input.message,
    })
    .returning({ id: contactMessages.id })

  let mail: Awaited<ReturnType<typeof notify>>
  try {
    mail = await notify(input)
  } catch (err) {
    mail = { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
  if (!mail.ok) console.error('Contact notification failed:', mail.error)
  await db
    .update(contactMessages)
    .set(
      mail.ok
        ? { mailStatus: 'sent', mailError: null }
        : { mailStatus: 'failed', mailError: mail.error.slice(0, 500) }
    )
    .where(eq(contactMessages.id, row.id))

  return { status: 200, body: { success: true } }
}
