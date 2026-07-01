'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Link2, Plus, Pencil, Trash2, ExternalLink, BarChart3, Settings,
  LogOut, GripVertical, Eye, EyeOff, Loader2, Copy, Check, Globe, BadgeCheck, QrCode
} from 'lucide-react'
import { useAuth, authFetch } from '@/hooks/useAuth'
import { QRModal } from '@/components/QRModal'
import { ThemeToggle } from '@/components/ThemeToggle'

interface LinkItem {
  id: string
  title: string
  url: string
  icon: string
  category: string
  position: number
  clicks: number
  isActive: boolean
}

const ICON_OPTIONS = [
  { value: 'link', label: 'Link' },
  { value: 'github', label: 'GitHub' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'resume', label: 'Resume' },
  { value: 'blog', label: 'Blog' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'email', label: 'Email' },
]

const CATEGORIES = ['general', 'social', 'work', 'creative', 'education', 'contact']

export default function DashboardPage() {
  const router = useRouter()
  const { user, token, logout } = useAuth()
  const [links, setLinks] = useState<LinkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editLink, setEditLink] = useState<LinkItem | null>(null)
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState({ title: '', url: '', icon: 'link', category: 'general' })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [showQR, setShowQR] = useState(false)

  // Drag & drop state
  const dragIndexRef = useRef<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    if (!token) { router.push('/login'); return }
    fetchLinks()
  }, [token])

  const fetchLinks = async () => {
    setLoading(true)
    try {
      const res = await authFetch('/api/links')
      if (res.ok) setLinks(await res.json())
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      const res = await authFetch('/api/links', { method: 'POST', body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) { setFormError(data.error); return }
      setLinks(l => [...l, data])
      setShowAddModal(false)
      setForm({ title: '', url: '', icon: 'link', category: 'general' })
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editLink) return
    setSaving(true)
    setFormError('')
    try {
      const res = await authFetch(`/api/links/${editLink.id}`, {
        method: 'PUT',
        body: JSON.stringify({ title: editLink.title, url: editLink.url, icon: editLink.icon, category: editLink.category })
      })
      const data = await res.json()
      if (!res.ok) { setFormError(data.error); return }
      setLinks(l => l.map(link => link.id === data.id ? data : link))
      setEditLink(null)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this link?')) return
    const res = await authFetch(`/api/links/${id}`, { method: 'DELETE' })
    if (res.ok) setLinks(l => l.filter(link => link.id !== id))
  }

  const toggleActive = async (link: LinkItem) => {
    const res = await authFetch(`/api/links/${link.id}`, {
      method: 'PUT',
      body: JSON.stringify({ isActive: !link.isActive })
    })
    if (res.ok) {
      const data = await res.json()
      setLinks(l => l.map(li => li.id === data.id ? data : li))
    }
  }

  const copyProfileUrl = () => {
    const url = `${window.location.origin}/${user?.username}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDragStart = (index: number) => {
    dragIndexRef.current = index
    setIsDragging(true)
  }

  const handleDragEnter = (index: number) => {
    if (dragIndexRef.current === null || dragIndexRef.current === index) return
    setDragOverIndex(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (dropIndex: number) => {
    const fromIndex = dragIndexRef.current
    if (fromIndex === null || fromIndex === dropIndex) return

    const reordered = [...links]
    const [moved] = reordered.splice(fromIndex, 1)
    reordered.splice(dropIndex, 0, moved)
    setLinks(reordered)

    // Persist to server
    authFetch('/api/links/reorder', {
      method: 'PUT',
      body: JSON.stringify({ orderedIds: reordered.map(l => l.id) }),
    })
  }

  const handleDragEnd = () => {
    dragIndexRef.current = null
    setDragOverIndex(null)
    setIsDragging(false)
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_oklch(0.4_0.22_270/0.15)_0%,_transparent_50%)]" />
      </div>

      {/* Sidebar + Main layout */}
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 border-r border-border/50 bg-sidebar/80 backdrop-blur p-4 fixed h-full">
          <Link href="/" className="flex items-center gap-2 mb-8 px-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Link2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold">LinkNest</span>
          </Link>

          <nav className="flex-1 space-y-1">
            {[
              { href: '/dashboard', icon: Link2, label: 'My Links', active: true },
              { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
              { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
            ].map(item => (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${item.active
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}>
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Profile area */}
          <div className="border-t border-border/50 pt-4 mt-4">
            <div className="flex items-center gap-3 px-2 mb-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  {user.emailVerified && (
                    <span title="Email verified">
                      <BadgeCheck className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
              </div>
            </div>
            <Link href={`/${user.username}`} target="_blank"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all mb-1">
              <Globe className="w-3.5 h-3.5" />
              View Public Profile
            </Link>
            <div className="flex items-center gap-2 px-3 py-1.5">
              <ThemeToggle className="w-7 h-7 rounded-lg text-xs" />
              <span className="text-xs text-muted-foreground">Toggle theme</span>
            </div>
            <button onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 md:ml-64 p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">My Links</h1>
              <p className="text-muted-foreground text-sm mt-1">{links.length} link{links.length !== 1 ? 's' : ''} in your profile</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={copyProfileUrl}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border/60 text-sm font-medium hover:bg-secondary/50 transition-all">
                {copied ? <><Check className="w-4 h-4 text-green-400" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy URL</>}
              </button>
              <button onClick={() => setShowQR(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border/60 text-sm font-medium hover:bg-secondary/50 transition-all">
                <QrCode className="w-4 h-4" /> QR Code
              </button>
              <button onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold text-sm hover:opacity-90 transition-all shadow-lg shadow-indigo-500/25">
                <Plus className="w-4 h-4" />
                Add Link
              </button>
            </div>
          </div>

          {/* Links List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : links.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Link2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold text-xl mb-2">No links yet</h3>
              <p className="text-muted-foreground mb-6">Add your first link to start building your profile</p>
              <button onClick={() => setShowAddModal(true)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold hover:opacity-90 transition-all">
                Add Your First Link
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {links.map((link, index) => {
                const isBeingDragged = isDragging && dragIndexRef.current === index
                const isDropTarget = dragOverIndex === index && dragIndexRef.current !== index
                return (
                  <div
                    key={link.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragEnter={() => handleDragEnter(index)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(index)}
                    onDragEnd={handleDragEnd}
                    className={[
                      'flex items-center gap-4 p-4 rounded-2xl border backdrop-blur transition-all duration-150 group select-none',
                      isBeingDragged
                        ? 'opacity-40 scale-[0.98] border-primary/50 bg-primary/5'
                        : isDropTarget
                          ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20 scale-[1.01]'
                          : 'bg-card/60 border-border/50 hover:border-primary/30',
                    ].join(' ')}
                  >
                    {/* Drag handle */}
                    <div
                      className="cursor-grab active:cursor-grabbing p-1 -ml-1 rounded-lg hover:bg-secondary/60 transition-colors flex-shrink-0"
                      title="Drag to reorder"
                    >
                      <GripVertical className="w-4 h-4 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors" />
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                      <Link2 className="w-5 h-5 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold truncate">{link.title}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/60 text-muted-foreground capitalize">{link.category}</span>
                        {!link.isActive && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">Hidden</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{link.url}</p>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                      <BarChart3 className="w-3.5 h-3.5" />
                      {link.clicks}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <a href={link.url} target="_blank" rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-all">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button onClick={() => toggleActive(link)}
                        className="p-2 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-all">
                        {link.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button onClick={() => setEditLink(link)}
                        className="p-2 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-all">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(link.id)}
                        className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}

              {/* Drag hint */}
              {links.length > 1 && (
                <p className="text-center text-xs text-muted-foreground/50 pt-1">
                  Drag <GripVertical className="inline w-3 h-3 -mt-0.5" /> to reorder links
                </p>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Add Link Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border/60 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Add New Link</h2>
            {formError && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{formError}</div>}
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Title</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="My Portfolio" required
                  className="w-full px-4 py-3 rounded-xl bg-secondary/60 border border-border/60 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">URL</label>
                <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                  placeholder="https://myportfolio.com" required type="url"
                  className="w-full px-4 py-3 rounded-xl bg-secondary/60 border border-border/60 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Icon</label>
                  <select value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-secondary/60 border border-border/60 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all">
                    {ICON_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-secondary/60 border border-border/60 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all capitalize">
                    {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowAddModal(false); setFormError('') }}
                  className="flex-1 py-3 rounded-xl border border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all font-medium">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold hover:opacity-90 disabled:opacity-60 transition-all flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Add Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Link Modal */}
      {editLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border/60 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Edit Link</h2>
            {formError && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{formError}</div>}
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Title</label>
                <input value={editLink.title} onChange={e => setEditLink(l => l ? { ...l, title: e.target.value } : null)}
                  placeholder="My Portfolio" required
                  className="w-full px-4 py-3 rounded-xl bg-secondary/60 border border-border/60 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">URL</label>
                <input value={editLink.url} onChange={e => setEditLink(l => l ? { ...l, url: e.target.value } : null)}
                  placeholder="https://myportfolio.com" required type="url"
                  className="w-full px-4 py-3 rounded-xl bg-secondary/60 border border-border/60 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Icon</label>
                  <select value={editLink.icon} onChange={e => setEditLink(l => l ? { ...l, icon: e.target.value } : null)}
                    className="w-full px-4 py-3 rounded-xl bg-secondary/60 border border-border/60 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all">
                    {ICON_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Category</label>
                  <select value={editLink.category} onChange={e => setEditLink(l => l ? { ...l, category: e.target.value } : null)}
                    className="w-full px-4 py-3 rounded-xl bg-secondary/60 border border-border/60 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all capitalize">
                    {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setEditLink(null); setFormError('') }}
                  className="flex-1 py-3 rounded-xl border border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all font-medium">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold hover:opacity-90 disabled:opacity-60 transition-all flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQR && user && (
        <QRModal
          url={`${typeof window !== 'undefined' ? window.location.origin : ''}/${user.username}`}
          username={user.username}
          onClose={() => setShowQR(false)}
        />
      )}
    </div>
  )
}
