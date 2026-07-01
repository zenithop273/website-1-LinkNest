import { NextRequest, NextResponse } from 'next/server'
import { db, links } from '@/db'
import { verifyJWT, getTokenFromHeader } from '@/lib/auth'
import { eq, asc } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const payload = await verifyJWT(getTokenFromHeader(req.headers.get('authorization')) || '')
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userLinks = await db.select().from(links)
      .where(eq(links.userId, payload.userId))
      .orderBy(asc(links.position))

    return NextResponse.json(userLinks)
  } catch (error) {
    console.error('Links GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await verifyJWT(getTokenFromHeader(req.headers.get('authorization')) || '')
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { title, url, icon, category, scheduledStart, scheduledEnd, linkPassword } = await req.json()
    if (!title || !url) {
      return NextResponse.json({ error: 'Title and URL are required' }, { status: 400 })
    }

    const existing = await db.select().from(links).where(eq(links.userId, payload.userId))
    const maxPos = existing.length > 0 ? Math.max(...existing.map(l => l.position)) + 1 : 0

    const [newLink] = await db.insert(links).values({
      userId: payload.userId,
      title, url,
      icon: icon || 'link',
      category: category || 'general',
      position: maxPos,
      scheduledStart: scheduledStart ? new Date(scheduledStart) : null,
      scheduledEnd: scheduledEnd ? new Date(scheduledEnd) : null,
      linkPassword: linkPassword || null,
    }).returning()

    return NextResponse.json(newLink, { status: 201 })
  } catch (error) {
    console.error('Links POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
