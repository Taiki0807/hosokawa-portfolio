'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { ownerAction } from '@/lib/admin/action'
import { getDb } from '@/lib/db/client'
import { contactMessages } from '@/lib/db/schema'

export const setInquiryStatus = ownerAction(
  z.object({ id: z.number().int().positive(), status: z.enum(['open', 'done', 'spam']) }),
  async ({ id, status }) => {
    await getDb().update(contactMessages).set({ status }).where(eq(contactMessages.id, id))
    revalidatePath('/admin', 'layout')
    return null
  }
)
