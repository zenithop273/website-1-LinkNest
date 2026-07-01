'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Loader2, Eye, EyeOff, Lock } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '', adminSecret: '' })
  const [showPass, setShowPass] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Login failed'); return }
      localStorage.setItem('admin-token', data.token)
      router.push('/admin')
    } catch {
      setError('Network error. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_oklch(0.35_0.22_270/0.25)_0%,_transparent_60%)]" />
      </div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-1">Admin Panel</h1>
          <p className="text-muted-foreground text-sm">Owner-only access — LinkNest Control Center</p>
        </div>

        <div className="bg-card/70 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-8 shadow-2xl shadow-black/40">
          <div className="flex items-center gap-2 mb-6 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
            <Lock className="w-3.5 h-3.5 flex-shrink-0" />
            Admin secret required. Keep this page URL private.
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input type="email" required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="owner@example.com"
                className="w-full px-4 py-3 rounded-xl bg-secondary/60 border border-border/60 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} required
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Account password"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-secondary/60 border border-border/60 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all" />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Admin Secret</label>
              <div className="relative">
                <input type={showSecret ? 'text' : 'password'} required
                  value={form.adminSecret}
                  onChange={e => setForm(f => ({ ...f, adminSecret: e.target.value }))}
                  placeholder="Secret key from .env"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-secondary/60 border border-border/60 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all" />
                <button type="button" onClick={() => setShowSecret(s => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Check your <code className="bg-secondary px-1 rounded">.env</code> file → <code className="bg-secondary px-1 rounded">ADMIN_SECRET</code></p>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold hover:opacity-90 disabled:opacity-60 transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 mt-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Verifying...</> : <><ShieldCheck className="w-4 h-4" />Enter Admin Panel</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
