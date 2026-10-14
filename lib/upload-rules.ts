// 画像アップロードの条件（クライアントとサーバーの両方で使う。サーバーで必ず再確認する）
export const ALLOWED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/svg+xml',
] as const
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024

const EXT: Record<(typeof ALLOWED_IMAGE_TYPES)[number], string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
}

export function extensionFor(type: string) {
  return EXT[type as keyof typeof EXT]
}

export function validateImageUpload(
  type: string,
  size: number
): { ok: true } | { ok: false; error: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return { ok: false, error: '画像は png / jpg / webp / svg のいずれかにしてください' }
  }
  if (!Number.isInteger(size) || size <= 0) return { ok: false, error: 'ファイルが空です' }
  if (size > MAX_IMAGE_BYTES) return { ok: false, error: '画像は 2MB 以下にしてください' }
  return { ok: true }
}
