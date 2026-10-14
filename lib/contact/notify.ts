import 'server-only'
import { Resend } from 'resend'
import { escapeHtml, type ContactInput } from './schema'

// 送信元は Resend で認証したドメインのアドレスにする（MAIL_FROM）。未設定のあいだは従来の値を使う
const DEFAULT_FROM = 'Hosokawa.dev <onboarding@resend.dev>'
const DEFAULT_TO = 'hosokawa.dev@gmail.com'

export async function sendContactNotification(
  input: ContactInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return { ok: false, error: 'RESEND_API_KEY is not set' }

  const resend = new Resend(apiKey)
  const { error } = await resend.emails.send({
    from: process.env.MAIL_FROM || DEFAULT_FROM,
    to: (process.env.MAIL_TO || DEFAULT_TO).split(',').map((s) => s.trim()),
    replyTo: input.email,
    subject: `[Contact] ${input.subject.replace(/[\r\n]+/g, ' ')}`,
    text: `名前: ${input.name}\nメール: ${input.email}\n件名: ${input.subject}\n\n${input.message}`,
    html: `
      <div style="font-family: sans-serif; line-height: 1.6;">
        <h2>お問い合わせがありました</h2>
        <p><strong>名前:</strong> ${escapeHtml(input.name)}</p>
        <p><strong>メール:</strong> ${escapeHtml(input.email)}</p>
        <p><strong>件名:</strong> ${escapeHtml(input.subject)}</p>
        <hr />
        <p style="white-space: pre-wrap;">${escapeHtml(input.message)}</p>
      </div>
    `,
  })
  return error ? { ok: false, error: `${error.name}: ${error.message}` } : { ok: true }
}
