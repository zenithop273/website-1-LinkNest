import { NextRequest, NextResponse } from 'next/server'
import { db, links } from '@/db'
import { verifyJWT, getTokenFromHeader } from '@/lib/auth'
import { eq, and } from 'drizzle-orm'

export async function PUT(req: NextRequest) {
  try {
    const payload = await verifyJWT(getTokenFromHeader(req.headers.get('authorization')) || '')
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { orderedIds } = await req.json() as { orderedIds: string[] }
    if (!Array.isArray(orderedIds)) return NextResponse.json({ error: 'orderedIds array required' }, { status: 400 })

    // Update positions
    await Promise.all(orderedIds.map((id, idx) =>
      db.update(links).set({ position: idx }).where(and(eq(links.id, id), eq(links.userId, payload.userId)))
    ))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reorder error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
