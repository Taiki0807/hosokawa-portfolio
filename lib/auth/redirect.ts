/** ログイン後の戻り先。オープンリダイレクトを防ぐため、サイト内の /admin 配下だけ許可する */
export function safeCallbackUrl(value: string | string[] | undefined): string {
  const v = Array.isArray(value) ? value[0] : value
  if (!v || !v.startsWith('/admin') || v.startsWith('//') || v.includes('\\')) return '/admin'
  return v
}

/** GitHub のログイン名として妥当なものだけ表示に使う */
export function safeGitHubLogin(value: string | string[] | undefined): string | null {
  const v = Array.isArray(value) ? value[0] : value
  return v && /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(v) ? v : null
}
