'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Link2, User, Palette, Plus, ArrowRight, Check, Loader2, ChevronLeft } from 'lucide-react'
import { useAuth, authFetch } from '@/hooks/useAuth'

const THEMES = [
  { id: 'default', label: 'Indigo',  color: 'from-indigo-500 to-violet-600' },
  { id: 'ocean',   label: 'Ocean',   color: 'from-blue-500 to-cyan-500' },
  { id: 'forest',  label: 'Forest',  color: 'from-green-500 to-emerald-500' },
  { id: 'sunset',  label: 'Sunset',  color: 'from-orange-500 to-rose-500' },
  { id: 'minimal', label: 'Minimal', color: 'from-gray-500 to-slate-500' },
]

const STEPS = [
  { id: 'profile', label: 'Profile',   icon: User },
  { id: 'theme',   label: 'Theme',     icon: Palette },
  { id: 'links',   label: 'Add Links', icon: Plus },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { user, updateUser } = useAuth()

  const [step, setStep] = useState(0)
  const [bio, setBio] = useState('')
  const [theme, setTheme] = useState('default')
  const [links, setLinks] = useState([{ title: '', url: '' }])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  if (!user) { router.push('/login'); return null }

  // ── Helpers ────────────────────────────────────────────────────────────────
  const addLink = () => setLinks(l => [...l, { title: '', url: '' }])
  const removeLink = (i: number) => setLinks(l => l.filter((_, idx) => idx !== i))
  const updateLink = (i: number, field: 'title' | 'url', val: string) =>
    setLinks(l => l.map((lk, idx) => idx === i ? { ...lk, [field]: val } : lk))

  // ── Final submit ───────────────────────────────────────────────────────────
  const handleFinish = async () => {
    setSaving(true); setError('')
    try {
      // Save profile
      const pr = await authFetch('/api/profile', {
        method: 'PUT',
        body: JSON.stringify({ bio, theme }),
      })
      if (pr.ok) { const d = await pr.json(); updateUser(d) }

      // Save valid links
      const validLinks = links.filter(l => l.title.trim() && l.url.trim())
      await Promise.all(validLinks.map(l =>
        authFetch('/api/links', { method: 'POST', body: JSON.stringify(l) })
      ))

      // Mark onboarding done in localStorage
      localStorage.setItem('ln-onboarded', 'true')
      router.push('/dashboard')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const skip = () => { localStorage.setItem('ln-onboarded', 'true'); router.push('/dashboard') }

  // ── UI ──────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_oklch(0.4_0.22_270/0.25)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_oklch(0.4_0.18_300/0.2)_0%,_transparent_50%)]" />
      </div>

      <div className="w-full max-w-lg">
        {/* Logo + skip */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Link2 className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-xl font-bold">LinkNest</span>
          </div>
          <button onClick={skip} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Skip setup →
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all flex-shrink-0 ${
                i < step  ? 'bg-primary text-primary-foreground' :
                i === step ? 'bg-primary/20 text-primary border-2 border-primary' :
                             'bg-secondary/60 text-muted-foreground'
              }`}>
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={`text-xs font-medium ${i === step ? 'text-foreground' : 'text-muted-foreground'}`}>
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px ${i < step ? 'bg-primary' : 'bg-border/60'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-card/70 backdrop-blur-xl border border-border/60 rounded-2xl p-8 shadow-2xl shadow-black/30">
          {error && <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">{error}</div>}

          {/* Step 0 — Profile */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold">Welcome, {user.name?.split(' ')[0]}! 👋</h2>
                <p className="text-muted-foreground text-sm mt-1">Let&apos;s set up your public profile in 3 quick steps.</p>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/40 border border-border/50">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-muted-foreground">@{user.username}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Your Bio <span className="text-muted-foreground font-normal">(optional)</span></label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                  placeholder="Full-stack developer · Building cool stuff · Open for freelance"
                  className="w-full px-4 py-3 rounded-xl bg-secondary/60 border border-border/60 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm" />
                <p className="text-xs text-muted-foreground mt-1">{bio.length}/160 characters</p>
              </div>
            </div>
          )}

          {/* Step 1 — Theme */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold">Pick Your Vibe 🎨</h2>
                <p className="text-muted-foreground text-sm mt-1">Choose a colour theme for your public profile page.</p>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {THEMES.map(t => (
                  <button key={t.id} onClick={() => setTheme(t.id)} type="button"
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                      theme === t.id ? 'border-primary ring-2 ring-primary/30 bg-primary/5' : 'border-border/60 hover:border-primary/50'
                    }`}>
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center`}>
                      {theme === t.id && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <span className="text-xs text-muted-foreground">{t.label}</span>
                  </button>
                ))}
              </div>
              {/* Preview */}
              <div className={`rounded-xl p-4 bg-gradient-to-br ${THEMES.find(t => t.id === theme)?.color ?? ''} bg-opacity-10`}>
                <p className="text-white/80 text-xs text-center">Preview: this is how your profile background will look</p>
              </div>
            </div>
          )}

          {/* Step 2 — Links */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold">Add Your Links 🔗</h2>
                <p className="text-muted-foreground text-sm mt-1">Add your most important links. You can add more later.</p>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {links.map((lk, i) => (
                  <div key={i} className="flex gap-2">
                    <div className="flex-1 space-y-1.5">
                      <input value={lk.title} onChange={e => updateLink(i, 'title', e.target.value)}
                        placeholder={['Portfolio', 'GitHub', 'LinkedIn', 'Resume'][i] ?? 'Title'}
                        className="w-full px-3 py-2.5 rounded-xl bg-secondary/60 border border-border/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                      <input value={lk.url} onChange={e => updateLink(i, 'url', e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2.5 rounded-xl bg-secondary/60 border border-border/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                    </div>
                    {links.length > 1 && (
                      <button onClick={() => removeLink(i)}
                        className="px-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all self-stretch">
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {links.length < 6 && (
                <button onClick={addLink} type="button"
                  className="w-full py-2.5 rounded-xl border border-dashed border-border/60 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-all flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Add another link
                </button>
              )}
            </div>
          )}

          {/* Nav buttons */}
          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border/60 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
            {step < 2 ? (
              <button onClick={() => setStep(s => s + 1)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold hover:opacity-90 transition-all shadow-lg shadow-indigo-500/25">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleFinish} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold hover:opacity-90 disabled:opacity-60 transition-all shadow-lg shadow-indigo-500/25">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : <><Check className="w-4 h-4" />Finish Setup</>}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          You can always change everything later in Settings.
        </p>
      </div>
    </div>
  )
}
