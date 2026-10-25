import 'server-only'
import { createHash } from 'crypto'

/** レート制限のキーにする、送信元 IP のハッシュ（IP をそのまま保存しない） */
export function clientKey(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  return createHash('sha256').update(ip).digest('hex').slice(0, 32)
}
