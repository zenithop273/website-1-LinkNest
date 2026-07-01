import { NextRequest, NextResponse } from 'next/server'
import { db, users, subscribers } from '@/db'
import { eq, and } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const { username, email } = await req.json()
    if (!username || !email) return NextResponse.json({ error: 'username and email required' }, { status: 400 })
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Invalid email' }, { status: 400 })

    const [user] = await db.select().from(users).where(eq(users.username, username.toLowerCase())).limit(1)
    if (!user) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    if (!user.newsletterEnabled) return NextResponse.json({ error: 'Newsletter not enabled' }, { status: 400 })

    // Duplicate check
    const existing = await db.select().from(subscribers).where(and(eq(subscribers.userId, user.id), eq(subscribers.email, email.toLowerCase()))).limit(1)
    if (existing.length > 0) return NextResponse.json({ message: 'Already subscribed!' })

    await db.insert(subscribers).values({ userId: user.id, email: email.toLowerCase() })
    return NextResponse.json({ message: 'Subscribed successfully!' })
  } catch (error) {
    console.error('Subscribe error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
