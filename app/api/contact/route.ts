import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { submitContact } from '@/lib/contact/submit'

function clientKey(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  // IP をそのまま保存しないようにハッシュにする
  return createHash('sha256').update(ip).digest('hex').slice(0, 32)
}

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
