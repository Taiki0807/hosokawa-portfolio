import { NextResponse } from 'next/server'
import { count, eq } from 'drizzle-orm'
import { adminRoute } from '@/lib/http/admin-route'
import { getDb } from '@/lib/db/client'
import { contactMessages } from '@/lib/db/schema'

export const GET = adminRoute(async () => {
  const [row] = await getDb()
    .select({ n: count() })
    .from(contactMessages)
    .where(eq(contactMessages.status, 'open'))
  return NextResponse.json(
    { openInquiries: row?.n ?? 0 },
    { headers: { 'Cache-Control': 'no-store' } }
  )
})
