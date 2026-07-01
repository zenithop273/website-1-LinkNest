import { NextRequest, NextResponse } from 'next/server'
import { db, links } from '@/db'
import { verifyJWT, getTokenFromHeader } from '@/lib/auth'
import { eq, and } from 'drizzle-orm'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const payload = await verifyJWT(getTokenFromHeader(req.headers.get('authorization')) || '')
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    if (body.title !== undefined) updateData.title = body.title
    if (body.url !== undefined) updateData.url = body.url
    if (body.icon !== undefined) updateData.icon = body.icon
    if (body.category !== undefined) updateData.category = body.category
    if (body.isActive !== undefined) updateData.isActive = body.isActive

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
    const { id } = await params
    const payload = await verifyJWT(getTokenFromHeader(req.headers.get('authorization')) || '')
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await db.delete(links).where(and(eq(links.id, id), eq(links.userId, payload.userId)))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Link DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
