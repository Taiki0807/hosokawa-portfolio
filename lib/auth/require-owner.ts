import { redirect } from 'next/navigation'
import { auth } from './config'
import { isAllowedLogin } from './allowlist'

// 認可はページ・Server Action・API ルートのそれぞれで毎回サーバー側で確認する
// （proxy.ts は早期リダイレクトのためだけで、それに頼らない）

export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized')
    this.name = 'UnauthorizedError'
  }
}

export type Owner = { login: string; name: string | null; image: string | null }

export async function getOwner(): Promise<Owner | null> {
  const session = await auth()
  const login = session?.user?.login
  // 許可リストは毎回見直す（リストから外したアカウントの既存セッションも無効にする）
  if (!login || !isAllowedLogin(login)) return null
  return { login, name: session.user.name ?? null, image: session.user.image ?? null }
}

/** Server Action・API ルート用。オーナーでなければ例外 */
export async function requireOwner(): Promise<Owner> {
  const owner = await getOwner()
  if (!owner) throw new UnauthorizedError()
  return owner
}

/** ページ用。未ログインは /login、許可外は /forbidden へ */
export async function requireOwnerPage(): Promise<Owner> {
  const session = await auth()
  const login = session?.user?.login
  if (!login) redirect('/login')
  if (!isAllowedLogin(login)) redirect(`/forbidden?login=${encodeURIComponent(login)}`)
  return { login, name: session.user.name ?? null, image: session.user.image ?? null }
}
