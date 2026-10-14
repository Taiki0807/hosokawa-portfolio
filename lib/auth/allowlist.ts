// 管理画面に入れる GitHub アカウント（ALLOWED_GITHUB_LOGINS、カンマ区切り）
// GitHub のログイン名は大文字・小文字を区別しないため、小文字で比較する

export function parseAllowlist(raw: string | undefined): string[] {
  return (raw ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

export function isAllowedLogin(
  login: string | null | undefined,
  allowlist: string[] = parseAllowlist(process.env.ALLOWED_GITHUB_LOGINS)
): boolean {
  if (!login) return false
  return allowlist.includes(login.trim().toLowerCase())
}
