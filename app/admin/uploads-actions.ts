'use server'

import { z } from 'zod'
import { ActionError, ownerAction } from '@/lib/admin/action'
import { createImageUploadUrl, verifyUploadedImage } from '@/lib/r2'
import { validateImageUpload } from '@/lib/upload-rules'

export const requestImageUpload = ownerAction(
  z.object({
    contentType: z.string(),
    size: z.number().int(),
    prefix: z.enum(['badges', 'posts']),
  }),
  async (input) => {
    const check = validateImageUpload(input.contentType, input.size)
    if (!check.ok) throw new ActionError(check.error)
    try {
      return await createImageUploadUrl(input)
    } catch (err) {
      throw new ActionError(err instanceof Error ? err.message : 'アップロードの準備に失敗しました')
    }
  }
)

export const confirmImageUpload = ownerAction(
  z.object({ key: z.string().max(100) }),
  async ({ key }) => {
    try {
      return await verifyUploadedImage(key)
    } catch (err) {
      throw new ActionError(err instanceof Error ? err.message : 'アップロードの確認に失敗しました')
    }
  }
)
