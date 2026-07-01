import { NextRequest, NextResponse } from 'next/server'
import { db, users } from '@/db'
import { hashPassword } from '@/lib/auth'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const { userId, otp, newPassword } = await req.json()
    if (!userId || !otp || !newPassword) return NextResponse.json({ error: 'All fields required' }, { status: 400 })
    if (newPassword.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
    if (!user) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    if (!user.resetToken || user.resetToken !== String(otp).trim()) return NextResponse.json({ error: 'Invalid code' }, { status: 400 })
    if (!user.resetTokenExpiry || new Date() > user.resetTokenExpiry) return NextResponse.json({ error: 'Code expired. Request a new one.' }, { status: 400 })

    const passwordHash = await hashPassword(newPassword)
    await db.update(users).set({ passwordHash, resetToken: null, resetTokenExpiry: null, updatedAt: new Date() }).where(eq(users.id, userId))

    return NextResponse.json({ message: 'Password reset successful. You can now log in.' })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
