'use client'
import Link from 'next/link'
import { ArrowRight, Link2, BarChart3, Palette, Globe, Star, Zap, Shield, Users } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { ThemeToggle } from '@/components/ThemeToggle'

const features = [
  { icon: Link2, title: 'All Links in One Place', desc: 'Organize your portfolio, GitHub, LinkedIn, resume and more on one beautiful page.' },
  { icon: Globe, title: 'Unique Public Profile', desc: 'Get your own linknest.app/username — share it anywhere, anytime.' },
  { icon: BarChart3, title: 'Real-Time Analytics', desc: 'Track clicks, visitors, and performance of each link with daily insights.' },
  { icon: Palette, title: 'Stunning Themes', desc: 'Choose from multiple beautiful themes to match your personal brand.' },
  { icon: Zap, title: 'Lightning Fast', desc: 'Built for speed — your profile loads instantly for every visitor.' },
  { icon: Shield, title: 'Secure & Private', desc: 'Your data is protected with JWT auth and secure password hashing.' },
]

const steps = [
  { num: '01', title: 'Create Account', desc: 'Sign up in seconds with email and choose your unique username' },
  { num: '02', title: 'Add Your Links', desc: 'Add all your important links with icons and custom categories' },
  { num: '03', title: 'Share & Track', desc: 'Share your public profile and watch analytics roll in' },
]

export default function LandingPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_oklch(0.4_0.22_270/0.3)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_oklch(0.4_0.18_300/0.25)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_oklch(0.35_0.15_200/0.2)_0%,_transparent_60%)]" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-xl bg-background/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Link2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">LinkNest</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Sign In
                </Link>
                <Link href="/register" className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/25">
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-8">
          <Star className="w-3.5 h-3.5" />
          Your personal link hub
        </div>
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
          All Your Links,{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
            One Beautiful
          </span>
          {' '}Page
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          LinkNest lets you create a stunning public profile to share your portfolio, GitHub, LinkedIn, resume, and every important link — all in one place.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register" className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold text-lg hover:opacity-90 transition-all shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5">
            Create Your LinkNest <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/login" className="flex items-center gap-2 px-8 py-4 rounded-xl border border-border/60 text-muted-foreground hover:text-foreground hover:border-border transition-all font-medium text-lg">
            Sign In
          </Link>
        </div>

        {/* Hero Profile Preview */}
        <div className="mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 bottom-0 h-32 top-auto" />
          <div className="max-w-sm mx-auto bg-card/60 backdrop-blur-xl border border-border/60 rounded-2xl p-6 shadow-2xl shadow-black/50">
            <div className="flex flex-col items-center gap-3 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-500/30">A</div>
              <div className="text-center">
                <p className="font-bold text-lg">Ankit Sharma</p>
                <p className="text-muted-foreground text-sm">Full-Stack Developer & Designer</p>
              </div>
            </div>
            {[
              { label: '🚀 Portfolio', color: 'from-indigo-500/20 to-violet-500/20 border-indigo-500/30' },
              { label: '💻 GitHub', color: 'from-slate-500/20 to-gray-500/20 border-slate-500/30' },
              { label: '💼 LinkedIn', color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30' },
              { label: '📄 Resume', color: 'from-green-500/20 to-emerald-500/20 border-green-500/30' },
            ].map((item) => (
              <div key={item.label} className={`w-full px-4 py-3 rounded-xl bg-gradient-to-r ${item.color} border text-sm font-medium text-center mb-2 cursor-pointer hover:scale-[1.02] transition-transform`}>
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-bold mb-4">Everything You Need</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">Powerful features to make your online presence stand out</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="group p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur hover:border-primary/50 hover:bg-card/80 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-bold mb-4">Get Started in Minutes</h2>
          <p className="text-muted-foreground text-lg">Three simple steps to your perfect link page</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.num} className="text-center">
              <div className="text-6xl font-black text-primary/20 mb-4">{s.num}</div>
              <h3 className="font-bold text-xl mb-2">{s.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="rounded-2xl bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-cyan-500/10 border border-indigo-500/20 p-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { val: '10K+', label: 'Active Users' },
              { val: '500K+', label: 'Links Created' },
              { val: '2M+', label: 'Profile Views' },
              { val: '99.9%', label: 'Uptime' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl font-black text-primary mb-2">{stat.val}</div>
                <div className="text-muted-foreground text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">Ready to Build Your Link Hub?</h2>
          <p className="text-muted-foreground text-lg mb-8">Join thousands of professionals who use LinkNest to share their online presence.</p>
          <Link href="/register" className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold text-lg hover:opacity-90 transition-all shadow-2xl shadow-indigo-500/30">
            Start for Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Link2 className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-foreground">LinkNest</span>
          </div>
          <p className="text-muted-foreground text-sm">© 2024 LinkNest. Built with ❤️ for creators.</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-foreground transition-colors">Login</Link>
            <Link href="/register" className="hover:text-foreground transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
