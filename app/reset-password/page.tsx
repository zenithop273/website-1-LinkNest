'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Link2, Loader2, Eye, EyeOff, CheckCircle2, RefreshCw } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const params = useSearchParams()
  const userId = params.get('userId') ?? ''
  const emailParam = params.get('email') ?? ''

  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => { if (!userId) router.push('/forgot-password') }, [userId, router])
  useEffect(() => { inputRefs.current[0]?.focus() }, [])

  const handleDigitChange = (i: number, v: string) => {
    const d = v.replace(/\D/g, '').slice(-1)
    const next = [...digits]; next[i] = d; setDigits(next); setError('')
    if (d && i < 5) inputRefs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputRefs.current[i - 1]?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const next = [...digits]; pasted.split('').forEach((ch, i) => { if (i < 6) next[i] = ch }); setDigits(next)
    inputRefs.current[Math.min(pasted.length - 1, 5)]?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const otp = digits.join('')
    if (otp.length < 6) { setError('Enter all 6 digits'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otp, newPassword: password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Reset failed'); setDigits(['', '', '', '', '', '']); inputRefs.current[0]?.focus(); return }
      setSuccess(true)
      setTimeout(() => router.push('/login'), 2000)
    } catch { setError('Network error. Try again.') }
    finally { setLoading(false) }
  }

  if (!userId) return null

  if (success) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Password Reset!</h2>
        <p className="text-muted-foreground text-sm">Redirecting to login…</p>
        <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto mt-3" />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_oklch(0.4_0.22_270/0.3)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_oklch(0.4_0.18_300/0.25)_0%,_transparent_50%)]" />
      </div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Link2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold">LinkNest</span>
          </Link>
          <h1 className="text-2xl font-bold mb-1">Reset Password</h1>
          <p className="text-muted-foreground text-sm">Enter the code sent to <strong className="text-foreground">{emailParam}</strong></p>
        </div>
        <div className="bg-card/60 backdrop-blur-xl border border-border/60 rounded-2xl p-8 shadow-2xl">
          {error && <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm text-center">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-center">6-digit code</label>
              <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                {digits.map((d, i) => (
                  <input key={i} ref={el => { inputRefs.current[i] = el }} type="text" inputMode="numeric" maxLength={1}
                    value={d} onChange={e => handleDigitChange(i, e.target.value)} onKeyDown={e => handleKeyDown(i, e)}
                    className={`w-11 h-13 text-center text-xl font-bold rounded-xl border bg-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/60 transition-all ${d ? 'border-primary/50' : 'border-border/60'}`} />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">New Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 characters" required minLength={6}
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-secondary/60 border border-border/60 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading || digits.join('').length < 6}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Resetting…</> : 'Reset Password'}
            </button>
          </form>
          <p className="text-center text-xs text-muted-foreground mt-4">
            <Link href="/forgot-password" className="text-primary hover:underline flex items-center justify-center gap-1"><RefreshCw className="w-3 h-3" />Request new code</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
