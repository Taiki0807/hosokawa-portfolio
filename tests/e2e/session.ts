import { encode } from 'next-auth/jwt'

// e2e 専用：GitHub を経由せずに、Auth.js と同じ形式のセッション Cookie を作る
export const SESSION_COOKIE = 'authjs.session-token'

export async function mintSessionCookie(login: string, secret: string) {
  return encode({
    token: { login, name: login, sub: login },
    secret,
    salt: SESSION_COOKIE,
    maxAge: 60 * 60,
  })
}
