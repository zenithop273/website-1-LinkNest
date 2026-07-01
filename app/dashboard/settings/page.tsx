'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Link2, Settings, BarChart3, LogOut, Loader2, Check, Globe, User, Share2, Mail, Copy, Zap, Trash2, Eye, EyeOff } from 'lucide-react'
import { useAuth, authFetch } from '@/hooks/useAuth'

const THEMES = [
  { id: 'default', label: 'Default', color: '#6366f1' },
  { id: 'ocean',   label: 'Ocean',   color: '#0ea5e9' },
  { id: 'forest',  label: 'Forest',  color: '#22c55e' },
  { id: 'sunset',  label: 'Sunset',  color: '#f97316' },
  { id: 'minimal', label: 'Minimal', color: '#a1a1aa' },
]

const SOCIAL_PLATFORMS = ['twitter','instagram','github','linkedin','youtube','facebook','tiktok','website']

export default function SettingsPage() {
  const router = useRouter()
  const { user, token, updateUser, logout } = useAuth()

  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [theme, setTheme] = useState('default')
  const [profileImage, setProfileImage] = useState('')
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({})
  const [newsletterEnabled, setNewsletterEnabled] = useState(false)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // UTM builder state
  const [utmBase, setUtmBase] = useState('')
  const [utmSource, setUtmSource] = useState('')
  const [utmMedium, setUtmMedium] = useState('')
  const [utmCampaign, setUtmCampaign] = useState('')
  const [utmCopied, setUtmCopied] = useState(false)

  // Account deletion state
  const [showDeleteSection, setShowDeleteSection] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [showDeletePass, setShowDeletePass] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    if (!token) { router.replace('/login'); return }
    if (user) {
      setName(user.name ?? '')
      setUsername(user.username ?? '')
      setBio(user.bio ?? '')
      setTheme(user.theme ?? 'default')
      setProfileImage(user.profileImage ?? '')
    }
    // Fetch full profile to get socialLinks + newsletterEnabled
    authFetch('/api/auth/profile').then(r => r.json()).then(d => {
      setSocialLinks(d.socialLinks ?? {})
      setNewsletterEnabled(d.newsletterEnabled ?? false)
    }).catch(() => {})
  }, [token, user, router])

  if (!token) return null

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setSuccessMsg(''); setErrorMsg('')
    try {
      const res = await authFetch('/api/profile', {
        method: 'PUT',
        body: JSON.stringify({ name, username, bio, theme, profileImage, socialLinks, newsletterEnabled }),
      })
      if (!res.ok) { const d = await res.json(); setErrorMsg(d.error || 'Failed'); return }
      const data = await res.json()
      updateUser(data)
      setSuccessMsg('Profile saved!')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch { setErrorMsg('Network error.') }
    finally { setSaving(false) }
  }

  const utmUrl = (() => {
    if (!utmBase) return ''
    try {
      const u = new URL(utmBase.startsWith('http') ? utmBase : `https://${utmBase}`)
      if (utmSource) u.searchParams.set('utm_source', utmSource)
      if (utmMedium) u.searchParams.set('utm_medium', utmMedium)
      if (utmCampaign) u.searchParams.set('utm_campaign', utmCampaign)
      return u.toString()
    } catch { return '' }
  })()

  const copyUtm = () => {
    if (!utmUrl) return
    navigator.clipboard.writeText(utmUrl)
    setUtmCopied(true); setTimeout(() => setUtmCopied(false), 2000)
  }

  async function handleDeleteAccount(e: React.FormEvent) {
    e.preventDefault()
    if (!deletePassword) { setDeleteError('Enter your password to confirm.'); return }
    setDeleting(true); setDeleteError('')
    try {
      const res = await authFetch('/api/account', {
        method: 'DELETE',
        body: JSON.stringify({ password: deletePassword }),
      })
      const data = await res.json()
      if (!res.ok) { setDeleteError(data.error || 'Deletion failed.'); return }
      logout()
      localStorage.removeItem('ln-onboarded')
      router.replace('/')
    } catch { setDeleteError('Network error. Try again.') }
    finally { setDeleting(false) }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-border/60 flex flex-col p-4 gap-2 bg-card/60 backdrop-blur fixed h-full hidden md:flex">
        <div className="flex items-center gap-2 px-2 py-3 mb-2">
          <Link2 className="w-5 h-5 text-primary" />
          <span className="font-bold text-lg">LinkNest</span>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {[
            { href: '/dashboard', icon: Link2, label: 'My Links' },
            { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
            { href: '/dashboard/settings', icon: Settings, label: 'Settings', active: true },
          ].map(item => (
            <a key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${item.active ? 'bg-primary/15 text-primary font-medium' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}`}>
              <item.icon className="w-4 h-4" />{item.label}
            </a>
          ))}
        </nav>
        <button onClick={() => { logout(); router.replace('/login') }}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </aside>

      <main className="flex-1 md:ml-64 p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Profile Settings</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your public profile, social links, and tools</p>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            {/* Profile Info */}
            <section className="bg-card/60 backdrop-blur border border-border/60 rounded-2xl p-6 space-y-4">
              <h2 className="font-semibold flex items-center gap-2 text-sm"><User className="w-4 h-4 text-primary" /> Profile Info</h2>
              {[
                { label: 'Name', val: name, set: setName, ph: 'Your display name' },
                { label: 'Profile Image URL', val: profileImage, set: setProfileImage, ph: 'https://example.com/photo.jpg' },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{f.label}</label>
                  <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                    className="mt-1 w-full bg-secondary/60 border border-border/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition" />
                </div>
              ))}
              <div>
                <label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Username</label>
                <div className="mt-1 flex items-center border border-border/60 rounded-xl bg-secondary/60 overflow-hidden focus-within:ring-2 focus-within:ring-primary/40 transition">
                  <span className="px-3 text-muted-foreground text-sm select-none">@</span>
                  <input value={username} onChange={e => setUsername(e.target.value)} placeholder="username"
                    className="flex-1 bg-transparent py-2.5 pr-4 text-sm focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Bio</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="A short bio..."
                  className="mt-1 w-full bg-secondary/60 border border-border/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition resize-none" />
              </div>
            </section>

            {/* Theme */}
            <section className="bg-card/60 backdrop-blur border border-border/60 rounded-2xl p-6 space-y-3">
              <h2 className="font-semibold flex items-center gap-2 text-sm"><Globe className="w-4 h-4 text-primary" /> Theme</h2>
              <div className="flex gap-3 flex-wrap">
                {THEMES.map(t => (
                  <button key={t.id} type="button" onClick={() => setTheme(t.id)}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${theme === t.id ? 'border-primary ring-2 ring-primary/30' : 'border-border/60 hover:border-border'}`}>
                    <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: t.color }}>
                      {theme === t.id && <Check className="w-4 h-4 text-white" />}
                    </span>
                    <span className="text-xs text-muted-foreground">{t.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Social Links */}
            <section className="bg-card/60 backdrop-blur border border-border/60 rounded-2xl p-6 space-y-3">
              <h2 className="font-semibold flex items-center gap-2 text-sm"><Share2 className="w-4 h-4 text-primary" /> Social Icons</h2>
              <p className="text-xs text-muted-foreground">These appear as icon buttons on your public profile.</p>
              <div className="grid grid-cols-2 gap-3">
                {SOCIAL_PLATFORMS.map(p => (
                  <div key={p}>
                    <label className="text-xs text-muted-foreground capitalize mb-1 block">{p}</label>
                    <input
                      value={socialLinks[p] ?? ''}
                      onChange={e => setSocialLinks(s => ({ ...s, [p]: e.target.value }))}
                      placeholder={`https://${p}.com/...`}
                      className="w-full bg-secondary/60 border border-border/60 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 transition" />
                  </div>
                ))}
              </div>
            </section>

            {/* Newsletter */}
            <section className="bg-card/60 backdrop-blur border border-border/60 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-sm">Newsletter Signup</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Show an email subscribe box on your public profile</p>
                  </div>
                </div>
                <button type="button" onClick={() => setNewsletterEnabled(n => !n)}
                  className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${newsletterEnabled ? 'bg-primary' : 'bg-secondary'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${newsletterEnabled ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
            </section>

            {/* Messages */}
            {successMsg && (
              <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl px-4 py-3 text-sm">
                <Check className="w-4 h-4" /> {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-xl px-4 py-3 text-sm">{errorMsg}</div>
            )}

            <button type="submit" disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl px-6 py-3 text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-all shadow-lg shadow-indigo-500/25">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : 'Save Changes'}
            </button>
          </form>

          {/* UTM Generator (separate — no save needed) */}
          <section className="bg-card/60 backdrop-blur border border-border/60 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold flex items-center gap-2 text-sm"><Zap className="w-4 h-4 text-amber-400" /> UTM Link Generator</h2>
            <p className="text-xs text-muted-foreground">Build trackable links for your marketing campaigns.</p>
            <div className="space-y-3">
              <input value={utmBase} onChange={e => setUtmBase(e.target.value)} placeholder="Base URL (e.g. https://yoursite.com)"
                className="w-full bg-secondary/60 border border-border/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition" />
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Source', val: utmSource, set: setUtmSource, ph: 'instagram' },
                  { label: 'Medium', val: utmMedium, set: setUtmMedium, ph: 'bio' },
                  { label: 'Campaign', val: utmCampaign, set: setUtmCampaign, ph: 'launch' },
                ].map(f => (
                  <div key={f.label}>
                    <label className="text-xs text-muted-foreground mb-1 block">{f.label}</label>
                    <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                      className="w-full bg-secondary/60 border border-border/60 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition" />
                  </div>
                ))}
              </div>
              {utmUrl && (
                <div className="flex gap-2 items-center">
                  <p className="flex-1 text-xs bg-secondary/60 border border-border/60 rounded-xl px-3 py-2 break-all text-muted-foreground">{utmUrl}</p>
                  <button type="button" onClick={copyUtm}
                    className="flex-shrink-0 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-medium hover:bg-amber-500/25 transition-all flex items-center gap-1.5">
                    {utmCopied ? <><Check className="w-3 h-3" />Copied</> : <><Copy className="w-3 h-3" />Copy</>}
                  </button>
                </div>
              )}
            </div>
          </section>
          {/* ── Danger Zone — Account Deletion ── */}
          <section className="bg-destructive/5 border border-destructive/30 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-destructive/15 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </div>
                <div>
                  <h2 className="font-semibold text-sm text-destructive">Danger Zone</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Permanently delete your account and all data</p>
                </div>
              </div>
              <button type="button" onClick={() => { setShowDeleteSection(s => !s); setDeleteError('') }}
                className="text-xs text-destructive hover:underline font-medium">
                {showDeleteSection ? 'Cancel' : 'Delete Account'}
              </button>
            </div>

            {showDeleteSection && (
              <form onSubmit={handleDeleteAccount} className="space-y-3 pt-2 border-t border-destructive/20">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This will permanently delete your account, all your links, and analytics data.
                  <strong className="text-destructive"> This action cannot be undone.</strong>
                </p>
                {deleteError && (
                  <p className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-xl px-3 py-2">{deleteError}</p>
                )}
                <div>
                  <label className="block text-xs font-medium mb-1.5">Confirm with your password</label>
                  <div className="relative">
                    <input type={showDeletePass ? 'text' : 'password'}
                      value={deletePassword} onChange={e => setDeletePassword(e.target.value)}
                      placeholder="Your current password"
                      className="w-full px-4 py-2.5 pr-10 rounded-xl bg-secondary/60 border border-destructive/40 text-sm focus:outline-none focus:ring-2 focus:ring-destructive/50 transition-all" />
                    <button type="button" onClick={() => setShowDeletePass(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showDeletePass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={deleting || !deletePassword}
                  className="w-full py-2.5 rounded-xl bg-destructive text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                  {deleting ? <><Loader2 className="w-4 h-4 animate-spin" />Deleting…</> : <><Trash2 className="w-4 h-4" />Yes, Delete My Account</>}
                </button>
              </form>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
