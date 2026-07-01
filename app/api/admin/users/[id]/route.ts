import { NextRequest, NextResponse } from 'next/server'
import { db, users } from '@/db'
import { requireAdmin } from '@/lib/adminAuth'
import { eq } from 'drizzle-orm'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const auth = await requireAdmin(req)
    if ('error' in auth) return auth.error

    const body = await req.json()
    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    if (body.isBanned !== undefined) updateData.isBanned = body.isBanned
    if (body.isAdmin !== undefined) updateData.isAdmin = body.isAdmin

    const [updated] = await db.update(users).set(updateData).where(eq(users.id, id)).returning()
    if (!updated) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Admin user PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const auth = await requireAdmin(req)
    if ('error' in auth) return auth.error

    await db.delete(users).where(eq(users.id, id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin user DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
