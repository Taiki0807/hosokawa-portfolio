import { NextResponse } from 'next/server'
import { clientKey } from '@/lib/client-key'
import { submitContact } from '@/lib/contact/submit'

export async function POST(request: Request) {
  try {
    const raw = await request.json().catch(() => null)
    const result = await submitContact(raw, clientKey(request))
    return NextResponse.json(result.body, { status: result.status })
  } catch (err) {
    console.error('Contact API error:', err)
    return NextResponse.json({ error: 'サーバーエラーが発生しました。' }, { status: 500 })
  }
}
