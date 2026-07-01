import { NextRequest, NextResponse } from 'next/server'
import { db, links } from '@/db'
import { verifyJWT, getTokenFromHeader } from '@/lib/auth'
import { eq, and } from 'drizzle-orm'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await verifyJWT(getTokenFromHeader(req.headers.get('authorization')) || '')
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const { title, url, icon, category, position, isActive, scheduledStart, scheduledEnd, linkPassword } = await req.json()

    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    if (title !== undefined) updateData.title = title
    if (url !== undefined) updateData.url = url
    if (icon !== undefined) updateData.icon = icon
    if (category !== undefined) updateData.category = category
    if (position !== undefined) updateData.position = position
    if (isActive !== undefined) updateData.isActive = isActive
    if (scheduledStart !== undefined) updateData.scheduledStart = scheduledStart ? new Date(scheduledStart) : null
    if (scheduledEnd !== undefined) updateData.scheduledEnd = scheduledEnd ? new Date(scheduledEnd) : null
    if (linkPassword !== undefined) updateData.linkPassword = linkPassword || null

    const [updated] = await db.update(links)
      .set(updateData)
      .where(and(eq(links.id, id), eq(links.userId, payload.userId)))
      .returning()

    if (!updated) return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Link PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await verifyJWT(getTokenFromHeader(req.headers.get('authorization')) || '')
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const deleted = await db.delete(links)
      .where(and(eq(links.id, id), eq(links.userId, payload.userId)))
      .returning()

    if (deleted.length === 0) return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Link DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
