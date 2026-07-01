import { NextRequest, NextResponse } from 'next/server'
import { db, users } from '@/db'
import { generateOTP, sendVerificationEmail } from '@/lib/email'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (user.emailVerified) return NextResponse.json({ error: 'Email already verified' }, { status: 400 })

    // Rate-limit: don't resend if previous token still has >10 min left
    if (user.verifyTokenExpiry) {
      const msLeft = user.verifyTokenExpiry.getTime() - Date.now()
      if (msLeft > 10 * 60 * 1000) {
        const minLeft = Math.ceil(msLeft / 60000)
        return NextResponse.json(
          { error: `Please wait ${minLeft} minute(s) before requesting a new code.` },
          { status: 429 }
        )
      }
    }

    const otp = generateOTP()
    const expiry = new Date(Date.now() + 15 * 60 * 1000)

    await db.update(users).set({
      verifyToken: otp,
      verifyTokenExpiry: expiry,
      updatedAt: new Date(),
    }).where(eq(users.id, userId))

    await sendVerificationEmail(user.email, user.name, otp)

    return NextResponse.json({ message: 'Verification code resent.' })
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
