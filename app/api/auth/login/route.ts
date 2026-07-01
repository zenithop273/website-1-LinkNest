import { NextRequest, NextResponse } from 'next/server'
import { db, users, loginLogs } from '@/db'
import { verifyPassword, signJWT } from '@/lib/auth'
import { rateLimit } from '@/lib/rateLimit'
import { eq } from 'drizzle-orm'

function parseUA(ua: string) {
  const device  = ua.includes('Mobile') ? 'mobile' : ua.includes('Tablet') ? 'tablet' : 'desktop'
  const browser = ua.includes('Edg') ? 'Edge' : ua.includes('Chrome') ? 'Chrome' : ua.includes('Firefox') ? 'Firefox' : ua.includes('Safari') ? 'Safari' : 'Other'
  const os      = ua.includes('Windows') ? 'Windows' : ua.includes('Mac') ? 'macOS' : ua.includes('Linux') ? 'Linux' : ua.includes('Android') ? 'Android' : ua.includes('iOS') || ua.includes('iPhone') ? 'iOS' : 'Unknown'
  return { device, browser, os }
}

async function recordLog(userId: string, req: NextRequest, success: boolean, failReason?: string) {
  try {
    const ip      = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown'
    const country = req.headers.get('cf-ipcountry') || req.headers.get('x-vercel-ip-country') || 'unknown'
    const ua      = req.headers.get('user-agent') || ''
    const { device, browser, os } = parseUA(ua)
    await db.insert(loginLogs).values({ userId, ip, country, device, browser, os, success, failReason })
  } catch { /* non-fatal */ }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown'
    if (!rateLimit(`login:${ip}`, 10, 60_000)) {
      return NextResponse.json({ error: 'Too many attempts. Please wait a minute.' }, { status: 429 })
    }

    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1)
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) {
      await recordLog(user.id, req, false, 'wrong_password')
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    if (user.isBanned) {
      await recordLog(user.id, req, false, 'account_banned')
      return NextResponse.json({ error: 'Your account has been suspended.' }, { status: 403 })
    }

    await recordLog(user.id, req, true)
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
        emailVerified: user.emailVerified,
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
