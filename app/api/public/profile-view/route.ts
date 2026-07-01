import { NextRequest, NextResponse } from 'next/server'
import { db, users } from '@/db'
import { eq, sql } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json()
    if (!username) return NextResponse.json({ ok: false }, { status: 400 })

    await db.update(users)
      .set({ profileViews: sql`${users.profileViews} + 1` })
      .where(eq(users.username, username.toLowerCase()))

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
