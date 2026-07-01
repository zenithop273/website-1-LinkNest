import type { Metadata } from 'next'
import { db, users } from '@/db'
import { eq } from 'drizzle-orm'

interface Props {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const [user] = await db.select().from(users).where(eq(users.username, username.toLowerCase())).limit(1)

  if (!user) {
    return {
      title: 'Profile not found — LinkNest',
      description: 'This profile does not exist on LinkNest.',
    }
  }

  const title = `${user.name} (@${user.username}) — LinkNest`
  const description = user.bio
    ? `${user.bio} | Find all links from ${user.name} on LinkNest.`
    : `Check out ${user.name}'s links on LinkNest — portfolio, social media, and more.`
  const profileUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://linknest.app'}/${username}`
  const avatar = user.profileImage || undefined

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: profileUrl,
      siteName: 'LinkNest',
      type: 'profile',
      ...(avatar ? { images: [{ url: avatar, width: 400, height: 400, alt: user.name }] } : {}),
    },
    twitter: {
      card: 'summary',
      title,
      description,
      ...(avatar ? { images: [avatar] } : {}),
    },
    alternates: { canonical: profileUrl },
    robots: { index: true, follow: true },
  }
}

export default function UsernameLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
