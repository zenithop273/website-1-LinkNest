import { NextRequest, NextResponse } from 'next/server'
import { db, users } from '@/db'
import { verifyJWT, getTokenFromHeader } from '@/lib/auth'
import { eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const payload = await verifyJWT(getTokenFromHeader(req.headers.get('authorization')) || '')
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [user] = await db.select().from(users).where(eq(users.id, payload.userId)).limit(1)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    return NextResponse.json({
      id: user.id, name: user.name, email: user.email,
      username: user.username, bio: user.bio,
      profileImage: user.profileImage, theme: user.theme,
      emailVerified: user.emailVerified,
      profileViews: user.profileViews,
      socialLinks: user.socialLinks ?? {},
      newsletterEnabled: user.newsletterEnabled,
      createdAt: user.createdAt,
    })
  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
