import { NextRequest, NextResponse } from 'next/server'
import { db, users, links } from '@/db'
import { eq, asc, and, or, isNull, lte, gte } from 'drizzle-orm'

export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    const { username } = await params
    const [user] = await db.select().from(users).where(eq(users.username, username.toLowerCase())).limit(1)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (user.isBanned) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const now = new Date()
    // Active + scheduling-aware filter
    const userLinks = await db.select().from(links)
      .where(and(
        eq(links.userId, user.id),
        eq(links.isActive, true),
        or(isNull(links.scheduledStart), lte(links.scheduledStart, now)),
        or(isNull(links.scheduledEnd), gte(links.scheduledEnd, now)),
      ))
      .orderBy(asc(links.position))

    return NextResponse.json({
      user: {
        name: user.name,
        username: user.username,
        bio: user.bio,
        profileImage: user.profileImage,
        theme: user.theme,
        profileViews: user.profileViews,
        socialLinks: user.socialLinks ?? {},
        newsletterEnabled: user.newsletterEnabled,
      },
      // Only expose whether password is required, not the actual password
      links: userLinks.map(l => ({ ...l, hasPassword: !!l.linkPassword, linkPassword: undefined })),
    })
  } catch (error) {
    console.error('Public profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
