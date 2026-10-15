import 'server-only'
import type { z } from 'zod'
import { requireOwner, UnauthorizedError, type Owner } from '@/lib/auth/require-owner'

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> }

export class ActionError extends Error {}

/**
 * Server Action 用のラッパー。毎回サーバー側でオーナーかを確認し、入力を zod で検証する
 * （UI の表示・非表示や proxy.ts には頼らない）
 */
export function ownerAction<S extends z.ZodType, T>(
  schema: S,
  handler: (input: z.infer<S>, owner: Owner) => Promise<T>
) {
  return async (raw: unknown): Promise<ActionResult<T>> => {
    let owner: Owner
    try {
      owner = await requireOwner()
    } catch (err) {
      if (err instanceof UnauthorizedError)
        return { ok: false, error: '権限がありません。ログインし直してください。' }
      throw err
    }
    const parsed = schema.safeParse(raw)
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path.join('.')
        if (!fieldErrors[key]) fieldErrors[key] = issue.message
      }
      return { ok: false, error: '入力内容を確認してください。', fieldErrors }
    }
    try {
      return { ok: true, data: await handler(parsed.data, owner) }
    } catch (err) {
      if (err instanceof ActionError) return { ok: false, error: err.message }
      console.error('Admin action failed:', err)
      return { ok: false, error: '保存に失敗しました。時間をおいてもう一度お試しください。' }
    }
  }
}
