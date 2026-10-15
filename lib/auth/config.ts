import NextAuth from 'next-auth'
import type {} from 'next-auth/jwt'
import GitHub from 'next-auth/providers/github'
import { isAllowedLogin } from './allowlist'

declare module 'next-auth' {
  interface Session {
    user: { login: string; name?: string | null; image?: string | null }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    login?: string
  }
}

// DB アダプタは使わず JWT セッションにする（許可リスト方式のため、ユーザーを保存する必要がない）
// Cookie は Auth.js の既定（httpOnly / secure（HTTPS 時）/ sameSite=lax）
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 7 },
  pages: { signIn: '/login', error: '/login' },
  callbacks: {
    signIn({ profile }) {
      const login = typeof profile?.login === 'string' ? profile.login : ''
      if (isAllowedLogin(login)) return true
      return `/forbidden?login=${encodeURIComponent(login)}`
    },
    jwt({ token, profile }) {
      if (profile && typeof profile.login === 'string') token.login = profile.login
      return token
    },
    session({ session, token }) {
      session.user.login = token.login ?? ''
      return session
    },
  },
})
