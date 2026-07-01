import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { db, users, links } from '@/db'
import { sql, desc, eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const check = await requireAdmin(req)
  if ('error' in check) return check.error

  const allUsers = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    username: users.username,
    isAdmin: users.isAdmin,
    isBanned: users.isBanned,
    theme: users.theme,
    createdAt: users.createdAt,
  }).from(users).orderBy(desc(users.createdAt))

  // attach link count per user
  const linkCounts = await db.select({
    userId: links.userId,
    count: sql<number>`count(*)`,
  }).from(links).groupBy(links.userId)

  const countMap = Object.fromEntries(linkCounts.map(r => [r.userId, Number(r.count)]))

  return NextResponse.json(
    allUsers.map(u => ({ ...u, linkCount: countMap[u.id] ?? 0 }))
  )
}
