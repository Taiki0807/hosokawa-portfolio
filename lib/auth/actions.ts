'use server'

import { signOut } from './config'

// クライアントの fetch で signOut すると、同じページの SessionProvider が
// 古い Cookie でセッションを取り直してしまい、ログアウトが取り消されることがある。
// Cookie はサーバー側で消し、画面の移動は呼び出し側で（再読み込みを伴って）行う。
export async function signOutAction() {
  await signOut({ redirect: false })
}
