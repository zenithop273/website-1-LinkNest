import { NextRequest, NextResponse } from 'next/server'
import { db, users } from '@/db'
import { verifyJWT, getTokenFromHeader } from '@/lib/auth'
import { eq } from 'drizzle-orm'

export async function PUT(req: NextRequest) {
  try {
    const payload = await verifyJWT(getTokenFromHeader(req.headers.get('authorization')) || '')
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { name, bio, profileImage, theme, username, socialLinks, newsletterEnabled } = await req.json()

    if (username && username.toLowerCase() !== payload.username) {
      if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        return NextResponse.json({ error: 'Invalid username format' }, { status: 400 })
      }
      const existing = await db.select().from(users).where(eq(users.username, username.toLowerCase())).limit(1)
      if (existing.length > 0) return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    if (name !== undefined) updateData.name = name
    if (bio !== undefined) updateData.bio = bio
    if (profileImage !== undefined) updateData.profileImage = profileImage
    if (theme !== undefined) updateData.theme = theme
    if (username !== undefined) updateData.username = username.toLowerCase()
    if (socialLinks !== undefined) updateData.socialLinks = socialLinks
    if (newsletterEnabled !== undefined) updateData.newsletterEnabled = newsletterEnabled

    const [updated] = await db.update(users).set(updateData).where(eq(users.id, payload.userId)).returning()

    return NextResponse.json({
      id: updated.id, name: updated.name, email: updated.email,
      username: updated.username, bio: updated.bio,
      profileImage: updated.profileImage, theme: updated.theme,
      socialLinks: updated.socialLinks, newsletterEnabled: updated.newsletterEnabled,
    })
  } catch (error) {
    console.error('Profile PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
