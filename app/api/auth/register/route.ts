import { NextRequest, NextResponse } from 'next/server'
import { db, users } from '@/db'
import { hashPassword, signJWT } from '@/lib/auth'
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

    const [newUser] = await db.insert(users).values({
      name,
      email: email.toLowerCase(),
      passwordHash,
      username: username.toLowerCase(),
      emailVerified: true,
    }).returning()

    const token = await signJWT({ userId: newUser.id, email: newUser.email, username: newUser.username })

    return NextResponse.json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        bio: newUser.bio ?? '',
        profileImage: newUser.profileImage ?? '',
        theme: newUser.theme ?? 'default',
        emailVerified: true,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
