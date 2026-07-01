import { verifyJWT, getTokenFromHeader } from './auth'
import { db, users } from '@/db'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function requireAdmin(req: NextRequest) {
  const payload = await verifyJWT(getTokenFromHeader(req.headers.get('authorization')) || '')
  if (!payload) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

  const [user] = await db.select().from(users).where(eq(users.id, payload.userId)).limit(1)
  if (!user?.isAdmin) return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }

  return { payload, user }
}
