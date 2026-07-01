'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Link2, Mail, Loader2, CheckCircle2, RefreshCw } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function VerifyEmailPage() {
  const router = useRouter()
  const params = useSearchParams()
  const { setAuth } = useAuth()

  const userId = params.get('userId') ?? ''
  const emailParam = params.get('email') ?? ''

  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [resendMsg, setResendMsg] = useState('')
  const [countdown, setCountdown] = useState(0)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Redirect if no userId in query
  useEffect(() => {
    if (!userId) router.push('/register')
  }, [userId, router])

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  // Auto-focus first input on mount
  useEffect(() => { inputRefs.current[0]?.focus() }, [])

  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = digit
    setDigits(next)
    setError('')
    if (digit && index < 5) inputRefs.current[index + 1]?.focus()
    // Auto-submit when last digit filled
    if (digit && index === 5) {
      const full = [...next].join('')
      if (full.length === 6) submitOTP(full)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus()
    if (e.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const next = [...digits]
    pasted.split('').forEach((ch, i) => { if (i < 6) next[i] = ch })
    setDigits(next)
    const lastIdx = Math.min(pasted.length - 1, 5)
    inputRefs.current[lastIdx]?.focus()
    if (pasted.length === 6) submitOTP(pasted)
  }

  const submitOTP = async (otp: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otp }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Verification failed')
        setDigits(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
        return
      }
      setSuccess(true)
      setAuth(data.token, data.user)
      // New users → onboarding; returning users → dashboard
      const onboarded = localStorage.getItem('ln-onboarded')
      setTimeout(() => router.push(onboarded ? '/dashboard' : '/onboarding'), 1800)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const otp = digits.join('')
    if (otp.length < 6) { setError('Enter all 6 digits'); return }
    submitOTP(otp)
  }

  const handleResend = async () => {
    setResending(true)
    setResendMsg('')
    setError('')
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setResendMsg('New code sent! Check your inbox.')
      setCountdown(60)
    } catch {
      setError('Failed to resend. Try again.')
    } finally {
      setResending(false)
    }
  }

  if (!userId) return null

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_oklch(0.4_0.22_270/0.3)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_oklch(0.4_0.18_300/0.25)_0%,_transparent_50%)]" />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Link2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold">LinkNest</span>
          </Link>
        </div>

        <div className="bg-card/60 backdrop-blur-xl border border-border/60 rounded-2xl p-8 shadow-2xl shadow-black/30">
          {success ? (
            <SuccessState />
          ) : (
            <VerifyForm
              emailParam={emailParam}
              digits={digits}
              inputRefs={inputRefs}
              loading={loading}
              resending={resending}
              error={error}
              resendMsg={resendMsg}
              countdown={countdown}
              onDigitChange={handleDigitChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onSubmit={handleSubmit}
              onResend={handleResend}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function SuccessState() {
  return (
    <div className="text-center py-4">
      <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="w-8 h-8 text-green-400" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Email Verified!</h2>
      <p className="text-muted-foreground text-sm">Your account is confirmed. Redirecting to dashboard…</p>
      <div className="mt-4 flex justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    </div>
  )
}

interface VerifyFormProps {
  emailParam: string
  digits: string[]
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>
  loading: boolean
  resending: boolean
  error: string
  resendMsg: string
  countdown: number
  onDigitChange: (i: number, v: string) => void
  onKeyDown: (i: number, e: React.KeyboardEvent) => void
  onPaste: (e: React.ClipboardEvent) => void
  onSubmit: (e: React.FormEvent) => void
  onResend: () => void
}

function VerifyForm({
  emailParam, digits, inputRefs, loading, resending,
  error, resendMsg, countdown,
  onDigitChange, onKeyDown, onPaste, onSubmit, onResend,
}: VerifyFormProps) {
  return (
    <>
      {/* Icon + heading */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-7 h-7 text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold mb-1">Check your email</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          We sent a 6-digit code to{' '}
          {emailParam
            ? <strong className="text-foreground">{emailParam}</strong>
            : 'your email address'
          }.
          <br />Enter it below to verify your account.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm text-center">
          {error}
        </div>
      )}
      {resendMsg && (
        <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm text-center">
          {resendMsg}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        {/* 6-box OTP input */}
        <div className="flex gap-2 justify-center" onPaste={onPaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => onDigitChange(i, e.target.value)}
              onKeyDown={e => onKeyDown(i, e)}
              disabled={loading}
              className={[
                'w-12 h-14 text-center text-2xl font-bold rounded-xl border bg-secondary/60 transition-all',
                'focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60',
                d ? 'border-primary/50 text-foreground' : 'border-border/60 text-muted-foreground',
                loading ? 'opacity-50 cursor-not-allowed' : '',
              ].join(' ')}
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || digits.join('').length < 6}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
        >
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" />Verifying…</>
            : 'Verify Email'
          }
        </button>
      </form>

      {/* Resend */}
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground mb-2">Didn&apos;t receive the code?</p>
        {countdown > 0 ? (
          <p className="text-xs text-muted-foreground">
            Resend available in <span className="text-primary font-mono">{countdown}s</span>
          </p>
        ) : (
          <button
            onClick={onResend}
            disabled={resending}
            className="flex items-center gap-1.5 text-sm text-primary hover:underline mx-auto disabled:opacity-50 transition-opacity"
          >
            {resending
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Sending…</>
              : <><RefreshCw className="w-3.5 h-3.5" />Resend code</>
            }
          </button>
        )}
      </div>

      <p className="text-center text-xs text-muted-foreground mt-4">
        Wrong account?{' '}
        <Link href="/register" className="text-primary hover:underline">Register again</Link>
      </p>
    </>
  )
}
