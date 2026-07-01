import Link from 'next/link'
import { Link2 } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_oklch(0.4_0.22_270/0.15)_0%,_transparent_50%)]" />
      </div>
      <nav className="border-b border-border/50 backdrop-blur-xl bg-background/70 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Link2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold">LinkNest</span>
          </Link>
          <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 2025</p>
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          {[
            { title: '1. Information We Collect', body: 'We collect: email address, name, username, and profile data you provide. We also collect analytics data including device type, browser, and country for link clicks.' },
            { title: '2. How We Use Your Information', body: 'We use your information to: provide and improve the service, send account-related emails (verification, password reset), and show you analytics about your profile.' },
            { title: '3. Data Storage', body: 'Your data is stored securely on our cloud database. Passwords are hashed using PBKDF2 with 100,000 iterations and are never stored in plain text.' },
            { title: '4. Cookies', body: 'We use localStorage to maintain your login session. We do not use third-party tracking cookies.' },
            { title: '5. Data Sharing', body: 'We do not sell, trade, or share your personal information with third parties, except as required by law.' },
            { title: '6. Analytics', body: 'When visitors click your links, we record the device type, browser, and country (from Cloudflare headers). No personally identifiable information about visitors is stored.' },
            { title: '7. Your Rights', body: 'You may request deletion of your account and all associated data at any time by contacting us or using the account deletion feature in settings.' },
            { title: '8. Children\'s Privacy', body: 'LinkNest is not intended for users under 13 years of age. We do not knowingly collect data from children.' },
            { title: '9. Contact', body: 'For privacy concerns, contact us at privacy@linknest.app.' },
          ].map(s => (
            <section key={s.title}>
              <h2 className="text-xl font-semibold text-foreground mb-2">{s.title}</h2>
              <p>{s.body}</p>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}
