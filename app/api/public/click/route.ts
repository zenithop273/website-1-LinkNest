import { NextRequest, NextResponse } from 'next/server'
import { db, links, analytics } from '@/db'
import { eq, sql } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const { linkId } = await req.json()
    if (!linkId) return NextResponse.json({ error: 'linkId required' }, { status: 400 })

    const [link] = await db.select().from(links).where(eq(links.id, linkId)).limit(1)
    if (!link) return NextResponse.json({ error: 'Link not found' }, { status: 404 })

    // Increment clicks
    await db.update(links).set({ clicks: sql`${links.clicks} + 1` }).where(eq(links.id, linkId))

    // Record analytics
    const ua = req.headers.get('user-agent') || ''
    const device = ua.includes('Mobile') ? 'mobile' : ua.includes('Tablet') ? 'tablet' : 'desktop'
    const country = req.headers.get('cf-ipcountry') || req.headers.get('x-vercel-ip-country') || 'unknown'

    await db.insert(analytics).values({
      linkId,
      userId: link.userId,
      device,
      browser: ua.includes('Chrome') ? 'chrome' : ua.includes('Firefox') ? 'firefox' : ua.includes('Safari') ? 'safari' : 'other',
      country,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Click track error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
