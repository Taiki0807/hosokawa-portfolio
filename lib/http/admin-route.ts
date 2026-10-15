import { NextResponse } from 'next/server'
import { requireOwner, UnauthorizedError, type Owner } from '@/lib/auth/require-owner'

/** 管理用 API ルートのラッパー。毎回サーバー側でオーナーかどうかを確認する */
export function adminRoute<Args extends unknown[]>(
  handler: (owner: Owner, ...args: Args) => Promise<Response>
) {
  return async (...args: Args): Promise<Response> => {
    let owner: Owner
    try {
      owner = await requireOwner()
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      throw err
    }
    return handler(owner, ...args)
  }
}
