import { count, eq } from 'drizzle-orm'
import { getDb } from '@/lib/db/client'
import { contactMessages } from '@/lib/db/schema'

export async function countOpenInquiries(): Promise<number> {
  const [row] = await getDb()
    .select({ n: count() })
    .from(contactMessages)
    .where(eq(contactMessages.status, 'open'))
  return row?.n ?? 0
}
