import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { isAllowedLogin } from '@/lib/auth/allowlist'

// /admin/** と管理用 API への早期リダイレクト。
// 認可の本体は各ページ・Server Action・API ルートの requireOwner() で行う
export const proxy = auth((req) => {
  const login = req.auth?.user?.login
  const isApi = req.nextUrl.pathname.startsWith('/api/')

  if (!login) {
    if (isApi) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const url = new URL('/login', req.nextUrl)
    url.searchParams.set('callbackUrl', req.nextUrl.pathname)
    return NextResponse.redirect(url)
  }
  if (!isAllowedLogin(login)) {
    if (isApi) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.redirect(new URL('/forbidden', req.nextUrl))
  }
  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
