import { NextRequest, NextResponse } from 'next/server'
import { db, users } from '@/db'
import { hashPassword } from '@/lib/auth'
import { generateOTP, sendVerificationEmail } from '@/lib/email'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, username } = await req.json()

    if (!name || !email || !password || !username) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return NextResponse.json({ error: 'Username can only contain letters, numbers, _ and -' }, { status: 400 })
    }

    const existingEmail = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1)
    if (existingEmail.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const existingUsername = await db.select().from(users).where(eq(users.username, username.toLowerCase())).limit(1)
    if (existingUsername.length > 0) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)
    const otp = generateOTP()
    const expiry = new Date(Date.now() + 15 * 60 * 1000) // 15 min

    const [newUser] = await db.insert(users).values({
      name,
      email: email.toLowerCase(),
      passwordHash,
      username: username.toLowerCase(),
      emailVerified: false,
      verifyToken: otp,
      verifyTokenExpiry: expiry,
    }).returning()

    // Send OTP email (non-blocking — don't fail registration if email fails)
    await sendVerificationEmail(newUser.email, newUser.name, otp)

    return NextResponse.json({
      message: 'Account created. Please verify your email.',
      email: newUser.email,
      userId: newUser.id,
    }, { status: 201 })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
