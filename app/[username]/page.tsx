'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Link2, ExternalLink, Lock, Eye, QrCode } from 'lucide-react'
import { QRModal } from '@/components/QRModal'

interface LinkItem {
  id: string; title: string; url: string
  icon?: string; category?: string; clicks: number
  isActive: boolean; hasPassword?: boolean
}
interface UserProfile {
  name: string; username: string; bio?: string
  profileImage?: string; theme?: string; profileViews?: number
  socialLinks?: Record<string, string>; newsletterEnabled?: boolean
}
interface ProfileData { user: UserProfile; links: LinkItem[] }

const SOCIAL_META: Record<string, { label: string; color: string; icon: string }> = {
  twitter:   { label: 'Twitter/X', color: '#1DA1F2', icon: '𝕏' },
  instagram: { label: 'Instagram', color: '#E1306C', icon: '📸' },
  github:    { label: 'GitHub',    color: '#fff',    icon: '⌨️' },
  linkedin:  { label: 'LinkedIn',  color: '#0077B5', icon: 'in' },
  youtube:   { label: 'YouTube',   color: '#FF0000', icon: '▶' },
  facebook:  { label: 'Facebook',  color: '#1877F2', icon: 'f' },
  tiktok:    { label: 'TikTok',    color: '#69C9D0', icon: '♪' },
  website:   { label: 'Website',   color: '#6366f1', icon: '🌐' },
}

const themes: Record<string, { bg: string; card: string; accent: string; avatar: string }> = {
  default: { bg: 'bg-gradient-to-br from-indigo-950 via-violet-950 to-indigo-900', card: 'bg-white/10 border-white/20 hover:bg-white/15', accent: 'text-violet-300', avatar: 'from-indigo-400 to-violet-500' },
  ocean:   { bg: 'bg-gradient-to-br from-blue-950 via-cyan-950 to-blue-900',       card: 'bg-white/10 border-white/20 hover:bg-white/15', accent: 'text-cyan-300',   avatar: 'from-blue-400 to-cyan-500' },
  forest:  { bg: 'bg-gradient-to-br from-green-950 via-emerald-950 to-green-900',  card: 'bg-white/10 border-white/20 hover:bg-white/15', accent: 'text-emerald-300',avatar: 'from-green-400 to-emerald-500' },
  sunset:  { bg: 'bg-gradient-to-br from-orange-950 via-rose-950 to-orange-900',   card: 'bg-white/10 border-white/20 hover:bg-white/15', accent: 'text-rose-300',   avatar: 'from-orange-400 to-rose-500' },
  minimal: { bg: 'bg-gradient-to-br from-gray-950 via-slate-900 to-gray-900',      card: 'bg-white/10 border-white/20 hover:bg-white/15', accent: 'text-slate-300',  avatar: 'from-gray-400 to-slate-500' },
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4 w-full animate-pulse">
      <div className="w-24 h-24 rounded-full bg-white/20" />
      <div className="h-5 w-36 rounded bg-white/20" />
      <div className="h-3 w-24 rounded bg-white/15" />
      <div className="h-3 w-48 rounded bg-white/10" />
      {[...Array(4)].map((_, i) => <div key={i} className="w-full h-14 rounded-xl bg-white/10" />)}
    </div>
  )
}

export default function PublicProfilePage() {
  const params = useParams()
  const username = typeof params.username === 'string' ? params.username : ''

  const [data, setData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [passwordLink, setPasswordLink] = useState<LinkItem | null>(null)
  const [pwInput, setPwInput] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [subMsg, setSubMsg] = useState('')
  const [subLoading, setSubLoading] = useState(false)

  useEffect(() => {
    if (!username) return
    fetch(`/api/public/${username}`)
      .then(r => { if (r.status === 404) { setNotFound(true); return null }; return r.json() })
      .then(json => { if (json) setData(json) })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))

    // Track profile view (fire and forget)
    fetch('/api/public/profile-view', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    }).catch(() => {})
  }, [username])

  const theme = themes[data?.user?.theme ?? 'default'] ?? themes.default

  async function handleLinkClick(link: LinkItem) {
    if (link.hasPassword) { setPasswordLink(link); return }
    try { await fetch('/api/public/click', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ linkId: link.id }) }) } catch {}
    window.open(link.url, '_blank', 'noopener,noreferrer')
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!passwordLink) return
    setPwLoading(true); setPwError('')
    try {
      const res = await fetch('/api/links/password-check', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkId: passwordLink.id, password: pwInput }),
      })
      const d = await res.json()
      if (!res.ok) { setPwError(d.error || 'Wrong password'); setPwLoading(false); return }
      setPasswordLink(null); setPwInput('')
      window.open(d.url, '_blank', 'noopener,noreferrer')
    } catch { setPwError('Error. Try again.') }
    finally { setPwLoading(false) }
  }

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    setSubLoading(true)
    const res = await fetch('/api/public/subscribe', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email }),
    })
    const d = await res.json()
    setSubMsg(d.message || d.error || 'Done!')
    setSubLoading(false)
  }

  if (!loading && notFound) return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-950 via-violet-950 to-indigo-900 flex flex-col items-center justify-center p-4">
      <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-4">
        <Link2 className="w-8 h-8 text-white/40" />
      </div>
      <h1 className="text-2xl font-bold text-white">Profile not found</h1>
      <p className="text-white/50 text-sm mt-2"><span className="text-white/70">@{username}</span> doesn&apos;t exist.</p>
    </main>
  )

  return (
    <main className={`min-h-screen ${theme.bg} flex flex-col items-center justify-start py-12 px-4`}>
      <div className="w-full max-w-sm flex flex-col items-center gap-5">
        {loading && <LoadingSkeleton />}

        {!loading && data && (
          <>
            {/* Avatar */}
            <div className="relative mt-4">
              {data.user.profileImage
                ? <img src={data.user.profileImage} alt={data.user.name} className="w-24 h-24 rounded-full object-cover ring-4 ring-white/20 shadow-2xl" />
                : <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${theme.avatar} flex items-center justify-center ring-4 ring-white/20 shadow-2xl`}>
                    <span className="text-3xl font-bold text-white">{data.user.name?.charAt(0).toUpperCase()}</span>
                  </div>
              }
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                <Link2 className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            {/* Identity */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">{data.user.name}</h1>
              <p className={`text-sm font-medium mt-0.5 ${theme.accent}`}>@{data.user.username}</p>
              {data.user.bio && <p className="text-white/60 text-sm mt-2 leading-relaxed max-w-xs">{data.user.bio}</p>}
              {(data.user.profileViews ?? 0) > 0 && (
                <p className="text-white/30 text-xs mt-2 flex items-center justify-center gap-1">
                  <Eye className="w-3 h-3" /> {data.user.profileViews?.toLocaleString()} views
                </p>
              )}
            </div>

            {/* Social Icons */}
            {data.user.socialLinks && Object.keys(data.user.socialLinks).filter(k => data.user.socialLinks![k]).length > 0 && (
              <div className="flex gap-2 flex-wrap justify-center">
                {Object.entries(data.user.socialLinks)
                  .filter(([, url]) => url)
                  .map(([platform, url]) => {
                    const meta = SOCIAL_META[platform]
                    if (!meta) return null
                    return (
                      <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all text-white text-sm font-bold hover:scale-110"
                        title={meta.label}>
                        {meta.icon}
                      </a>
                    )
                  })
                }
              </div>
            )}

            {/* QR + actions */}
            <button onClick={() => setShowQR(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-xs font-medium transition-all">
              <QrCode className="w-3.5 h-3.5" /> QR Code
            </button>

            {/* Links */}
            <div className="w-full flex flex-col gap-3">
              {data.links.filter(l => l.isActive).map(link => (
                <button key={link.id} onClick={() => handleLinkClick(link)}
                  className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl border backdrop-blur-sm transition-all duration-200 cursor-pointer group ${theme.card} text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]`}>
                  {link.hasPassword && <Lock className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />}
                  <span className="flex-1 text-left font-semibold text-sm">{link.title}</span>
                  <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors shrink-0" />
                </button>
              ))}
              {data.links.filter(l => l.isActive).length === 0 && (
                <p className="text-center text-white/30 text-sm py-8">No links added yet.</p>
              )}
            </div>

            {/* Newsletter */}
            {data.user.newsletterEnabled && (
              <div className="w-full bg-white/10 border border-white/20 rounded-2xl p-5 mt-2">
                <h3 className="text-white font-semibold text-sm mb-1">Stay Updated</h3>
                <p className="text-white/50 text-xs mb-3">Subscribe to get updates from {data.user.name}.</p>
                {subMsg ? (
                  <p className="text-center text-white/70 text-sm py-1">{subMsg}</p>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex gap-2">
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                      placeholder="your@email.com"
                      className="flex-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-white/40" />
                    <button type="submit" disabled={subLoading}
                      className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-medium transition-all disabled:opacity-50">
                      {subLoading ? '…' : 'Subscribe'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <footer className="mt-6 pb-4">
          <a href="/" className="flex items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors text-xs">
            <Link2 className="w-3 h-3" /> Powered by <span className="font-semibold ml-1">LinkNest</span>
          </a>
        </footer>
      </div>

      {/* QR Modal */}
      {showQR && (
        <QRModal
          url={`${typeof window !== 'undefined' ? window.location.origin : ''}/${username}`}
          username={username}
          onClose={() => setShowQR(false)}
        />
      )}

      {/* Password Modal */}
      {passwordLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-xl">
            <div className="text-center mb-4">
              <Lock className="w-8 h-8 text-white/60 mx-auto mb-2" />
              <h3 className="text-white font-bold">Protected Link</h3>
              <p className="text-white/50 text-sm mt-1">&quot;{passwordLink.title}&quot; requires a password</p>
            </div>
            {pwError && <p className="text-red-400 text-xs text-center mb-3">{pwError}</p>}
            <form onSubmit={handlePasswordSubmit} className="flex gap-2">
              <input type="password" value={pwInput} onChange={e => setPwInput(e.target.value)} required
                placeholder="Enter password" autoFocus
                className="flex-1 px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-white/40" />
              <button type="submit" disabled={pwLoading}
                className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-medium text-sm transition-all">
                {pwLoading ? '…' : 'Open'}
              </button>
            </form>
            <button onClick={() => { setPasswordLink(null); setPwInput(''); setPwError('') }}
              className="w-full mt-3 text-white/40 hover:text-white/70 text-xs transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
