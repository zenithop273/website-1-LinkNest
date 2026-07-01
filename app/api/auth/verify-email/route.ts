import { NextRequest, NextResponse } from 'next/server'
import { db, users } from '@/db'
import { signJWT } from '@/lib/auth'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const { userId, otp } = await req.json()
    if (!userId || !otp) {
      return NextResponse.json({ error: 'userId and otp are required' }, { status: 400 })
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    if (user.emailVerified) {
      return NextResponse.json({ error: 'Email already verified' }, { status: 400 })
    }

    if (!user.verifyToken || user.verifyToken !== String(otp).trim()) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 })
    }

    if (!user.verifyTokenExpiry || new Date() > user.verifyTokenExpiry) {
      return NextResponse.json({ error: 'Verification code has expired. Request a new one.' }, { status: 400 })
    }

    // Mark verified, clear token
    await db.update(users).set({
      emailVerified: true,
      verifyToken: null,
      verifyTokenExpiry: null,
      updatedAt: new Date(),
    }).where(eq(users.id, userId))

    const token = await signJWT({ userId: user.id, email: user.email, username: user.username })

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        bio: user.bio ?? '',
        profileImage: user.profileImage ?? '',
        theme: user.theme ?? 'default',
        emailVerified: true,
      },
    })
  } catch (error) {
    console.error('Verify email error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
