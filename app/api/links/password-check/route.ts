import { NextRequest, NextResponse } from 'next/server'
import { db, links } from '@/db'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const { linkId, password } = await req.json()
    if (!linkId || !password) return NextResponse.json({ error: 'linkId and password required' }, { status: 400 })

    const [link] = await db.select().from(links).where(eq(links.id, linkId)).limit(1)
    if (!link) return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    if (!link.linkPassword) return NextResponse.json({ correct: true, url: link.url })
    if (link.linkPassword !== password) return NextResponse.json({ correct: false, error: 'Wrong password' }, { status: 401 })

    // Track click
    await fetch(`${req.nextUrl.origin}/api/public/click`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ linkId }),
    }).catch(() => {})

    return NextResponse.json({ correct: true, url: link.url })
  } catch (error) {
    console.error('Password check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
