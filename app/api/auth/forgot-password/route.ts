import { NextRequest, NextResponse } from 'next/server'
import { db, users } from '@/db'
import { generateOTP, sendPasswordResetEmail } from '@/lib/email'
import { rateLimit } from '@/lib/rateLimit'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown'
    if (!rateLimit(`forgot:${ip}`, 5, 60_000)) {
      return NextResponse.json({ error: 'Too many requests. Please wait.' }, { status: 429 })
    }

    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1)
    // Always return success to avoid user enumeration
    if (!user) return NextResponse.json({ message: 'If that email exists, a reset code has been sent.' })

    const otp = generateOTP()
    const expiry = new Date(Date.now() + 15 * 60 * 1000)

    await db.update(users).set({ resetToken: otp, resetTokenExpiry: expiry, updatedAt: new Date() }).where(eq(users.id, user.id))
    await sendPasswordResetEmail(user.email, user.name, otp)

    return NextResponse.json({ message: 'If that email exists, a reset code has been sent.', userId: user.id })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
