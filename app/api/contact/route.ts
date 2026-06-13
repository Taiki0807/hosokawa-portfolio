import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json()

    // 簡易バリデーション
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: '全ての項目を入力してください。' }, { status: 400 })
    }

    const { error } = await resend.emails.send({
      // "from" はResendで認証済みのドメインのアドレスにする
      // 例: 'Hosokawa.dev <noreply@hosokawa-lab.dev>'
      from: 'Hosokawa.dev <onboarding@resend.dev>',
      to: ['hosokawa.dev@gmail.com'], // 受け取りたい自分のメールアドレス
      replyTo: email, // 返信は送信者へ
      subject: `[Contact] ${subject}`,
      text: `名前: ${name}\nメール: ${email}\n\n${message}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6;">
          <h2>お問い合わせがありました</h2>
          <p><strong>名前:</strong> ${name}</p>
          <p><strong>メール:</strong> ${email}</p>
          <p><strong>件名:</strong> ${subject}</p>
          <hr />
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: '送信に失敗しました。' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact API error:', err)
    return NextResponse.json({ error: 'サーバーエラーが発生しました。' }, { status: 500 })
  }
}
