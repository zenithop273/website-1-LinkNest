'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ShieldCheck, Users, Link2, MousePointer, TrendingUp,
  Trash2, Ban, ShieldOff, UserCheck, Loader2, RefreshCw,
  BarChart3, LogOut, ExternalLink, AlertTriangle, Globe, Smartphone, Monitor,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

// ── Colour palettes ────────────────────────────────────────────────────────────
const DEVICE_COLORS: Record<string, string> = {
  mobile: '#6366f1', desktop: '#8b5cf6', tablet: '#06b6d4', unknown: '#64748b',
}
const GEO_PALETTE = ['#f59e0b','#ef4444','#6366f1','#10b981','#06b6d4','#ec4899','#8b5cf6','#fbbf24','#34d399','#a78bfa']

// ── Types ──────────────────────────────────────────────────────────────────────
interface SiteStats {
  totalUsers: number
  totalLinks: number
  totalClicks: number
  totalVisits: number
  newUsersThisWeek: number
  dailySignups: { date: string; count: number }[]
  dailyClicks: { date: string; count: number }[]
  deviceBreakdown: { device: string; count: number }[]
  countryBreakdown: { country: string; count: number }[]
  topUsers: { userId: string; name: string; username: string; totalClicks: number; linkCount: number }[]
}

interface AdminUser {
  id: string
  name: string
  email: string
  username: string
  isAdmin: boolean
  isBanned: boolean
  theme: string
  linkCount: number
  createdAt: string
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: number | string; sub?: string; color: string
}) {
  return (
    <div className="bg-card/60 backdrop-blur border border-border/50 rounded-2xl p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
      {sub && <p className="text-xs text-primary mt-1">{sub}</p>}
    </div>
  )
}

export default function AdminPage() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [stats, setStats] = useState<SiteStats | null>(null)
  const [userList, setUserList] = useState<AdminUser[]>([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'overview' | 'analytics' | 'users'>('overview')

  useEffect(() => {
    const t = localStorage.getItem('admin-token')
    if (!t) { router.push('/admin/login'); return }
    setToken(t)
  }, [router])

  const authHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token])

  useEffect(() => {
    if (!token) return
    fetchStats()
    fetchUsers()
  }, [token])

  const fetchStats = async () => {
    setLoadingStats(true)
    try {
      const res = await fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
      if (res.status === 401 || res.status === 403) { router.push('/admin/login'); return }
      if (res.ok) setStats(await res.json())
    } finally { setLoadingStats(false) }
  }

  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const res = await fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) setUserList(await res.json())
    } finally { setLoadingUsers(false) }
  }

  const patchUser = async (id: string, body: object) => {
    setActionId(id)
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH', headers: authHeaders(), body: JSON.stringify(body),
      })
      if (res.ok) await fetchUsers()
    } finally { setActionId(null) }
  }

  const deleteUser = async (id: string, name: string) => {
    if (!confirm(`Delete user "${name}" and all their links? This cannot be undone.`)) return
    setActionId(id)
    try {
      await fetch(`/api/admin/users/${id}`, { method: 'DELETE', headers: authHeaders() })
      setUserList(u => u.filter(x => x.id !== id))
    } finally { setActionId(null) }
  }

  const logout = () => { localStorage.removeItem('admin-token'); router.push('/admin/login') }

  const filtered = userList.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  )

  if (!token) return null

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.35_0.18_40/0.15)_0%,_transparent_50%)]" />
      </div>

      {/* Top nav */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm">LinkNest Admin</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">Owner</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" target="_blank" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
              <ExternalLink className="w-3 h-3" /> View Site
            </Link>
            <button onClick={logout} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-8 bg-secondary/40 rounded-xl p-1 w-fit">
          {([
            { id: 'overview',   label: '📊 Overview' },
            { id: 'analytics',  label: '📈 Analytics' },
            { id: 'users',      label: `👥 Users (${userList.length})` },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <div className="space-y-8">
            {loadingStats ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>
            ) : stats ? (
              <>
                {/* Stat cards */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="bg-indigo-500/15 text-indigo-400" />
                  <StatCard icon={Link2} label="Total Links" value={stats.totalLinks} color="bg-violet-500/15 text-violet-400" />
                  <StatCard icon={MousePointer} label="Total Clicks" value={stats.totalClicks} color="bg-cyan-500/15 text-cyan-400" />
                  <StatCard icon={BarChart3} label="Total Visits" value={stats.totalVisits} color="bg-green-500/15 text-green-400" />
                  <StatCard icon={TrendingUp} label="New This Week" value={stats.newUsersThisWeek} sub="new users" color="bg-amber-500/15 text-amber-400" />
                </div>

                {/* Daily signups chart */}
                <div className="bg-card/60 backdrop-blur border border-border/50 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-lg">Daily Signups — Last 7 Days</h2>
                    <button onClick={fetchStats} className="p-2 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-all">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                  {stats.dailySignups.length === 0 ? (
                    <p className="text-center text-muted-foreground py-10 text-sm">No signup data yet</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={stats.dailySignups} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                        <XAxis dataKey="date" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                          tickFormatter={d => new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' })} />
                        <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }}
                          labelFormatter={d => new Date(d).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })} />
                        <Bar dataKey="count" fill="oklch(0.6 0.18 40)" radius={[6, 6, 0, 0]} name="Signups" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* ANALYTICS TAB */}
        {tab === 'analytics' && (
          <div className="space-y-6">
            {loadingStats ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              </div>
            ) : stats ? (
              <>
                {/* Daily clicks line */}
                <div className="bg-card/60 backdrop-blur border border-border/50 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold">Daily Clicks — Last 7 Days</h2>
                    <button onClick={fetchStats} className="p-2 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-all">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                  {stats.dailyClicks.length === 0
                    ? <p className="text-center text-muted-foreground py-8 text-sm">No click data yet</p>
                    : (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={stats.dailyClicks} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                          <XAxis dataKey="date" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} tickLine={false} axisLine={false}
                            tickFormatter={d => new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' })} />
                          <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                          <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }} />
                          <Bar dataKey="count" fill="oklch(0.6 0.22 270)" radius={[6, 6, 0, 0]} name="Clicks" />
                        </BarChart>
                      </ResponsiveContainer>
                    )
                  }
                </div>

                {/* Device pie + Country bars */}
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Device breakdown */}
                  <div className="bg-card/60 backdrop-blur border border-border/50 rounded-2xl p-6">
                    <h2 className="font-bold mb-4">Device Breakdown</h2>
                    {stats.deviceBreakdown.length === 0
                      ? <p className="text-muted-foreground text-sm py-8 text-center">No data yet</p>
                      : (() => {
                          const pieData = stats.deviceBreakdown.map(d => ({ name: d.device, value: Number(d.count) }))
                          const total = pieData.reduce((s, d) => s + d.value, 0)
                          return (
                            <>
                              <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" labelLine={false}
                                    label={({ cx: cx2, cy: cy2, midAngle, innerRadius, outerRadius: or, percent }) => {
                                      if (percent < 0.06) return null
                                      const R = innerRadius + (or - innerRadius) * 0.55
                                      const x2 = cx2 + R * Math.cos(-midAngle * Math.PI / 180)
                                      const y2 = cy2 + R * Math.sin(-midAngle * Math.PI / 180)
                                      return <text x={x2} y={y2} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>{`${(percent*100).toFixed(0)}%`}</text>
                                    }}>
                                    {pieData.map(entry => <Cell key={entry.name} fill={DEVICE_COLORS[entry.name] ?? '#64748b'} />)}
                                  </Pie>
                                  <Legend formatter={v => <span style={{ fontSize: 12, color: 'var(--muted-foreground)', textTransform: 'capitalize' }}>{v}</span>} />
                                  <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }} />
                                </PieChart>
                              </ResponsiveContainer>
                              <div className="mt-3 space-y-2">
                                {pieData.map(d => (
                                  <div key={d.name} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: DEVICE_COLORS[d.name] ?? '#64748b' }} />
                                      <span className="text-muted-foreground capitalize flex items-center gap-1.5">
                                        {d.name === 'mobile' ? <Smartphone className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
                                        {d.name}
                                      </span>
                                    </div>
                                    <span className="font-semibold">{d.value.toLocaleString()} <span className="text-xs text-muted-foreground">({total ? Math.round(d.value/total*100) : 0}%)</span></span>
                                  </div>
                                ))}
                              </div>
                            </>
                          )
                        })()
                    }
                  </div>

                  {/* Country breakdown */}
                  <div className="bg-card/60 backdrop-blur border border-border/50 rounded-2xl p-6">
                    <h2 className="font-bold mb-4 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-amber-400" /> Top Countries
                    </h2>
                    {stats.countryBreakdown.length === 0
                      ? <p className="text-muted-foreground text-sm py-8 text-center">No geo data yet</p>
                      : (() => {
                          const sorted = [...stats.countryBreakdown].sort((a, b) => Number(b.count) - Number(a.count)).slice(0, 8)
                          const max = Number(sorted[0]?.count) || 1
                          return (
                            <div className="space-y-3">
                              {sorted.map((c, i) => (
                                <div key={c.country} className="flex items-center gap-3">
                                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: GEO_PALETTE[i % GEO_PALETTE.length] }} />
                                  <span className="text-sm text-muted-foreground w-20 truncate capitalize">{c.country === 'unknown' ? 'Unknown' : c.country}</span>
                                  <div className="flex-1 bg-secondary/60 rounded-full h-2 overflow-hidden">
                                    <div className="h-2 rounded-full transition-all duration-500"
                                      style={{ width: `${Math.round(Number(c.count)/max*100)}%`, background: GEO_PALETTE[i % GEO_PALETTE.length] }} />
                                  </div>
                                  <span className="text-sm font-semibold w-8 text-right">{Number(c.count)}</span>
                                </div>
                              ))}
                            </div>
                          )
                        })()
                    }
                  </div>
                </div>

                {/* Top users by clicks */}
                <div className="bg-card/60 backdrop-blur border border-border/50 rounded-2xl p-6">
                  <h2 className="font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-400" /> Top Users by Link Clicks
                  </h2>
                  {stats.topUsers.length === 0
                    ? <p className="text-muted-foreground text-sm">No data yet</p>
                    : (() => {
                        const maxClicks = stats.topUsers[0]?.totalClicks || 1
                        return (
                          <div className="space-y-3">
                            {stats.topUsers.map((u, i) => (
                              <div key={u.userId} className="flex items-center gap-4 px-4 py-3 bg-secondary/30 rounded-xl">
                                <span className="text-xs font-bold text-muted-foreground/50 w-5 text-right">#{i+1}</span>
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                  {u.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{u.name}</p>
                                  <div className="mt-1 bg-secondary/60 rounded-full h-1.5 overflow-hidden">
                                    <div className="h-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
                                      style={{ width: `${Math.round(u.totalClicks/maxClicks*100)}%` }} />
                                  </div>
                                </div>
                                <div className="flex flex-col items-end flex-shrink-0">
                                  <span className="text-sm font-semibold text-amber-400 flex items-center gap-1">
                                    <MousePointer className="w-3.5 h-3.5" />{u.totalClicks.toLocaleString()}
                                  </span>
                                  <span className="text-xs text-muted-foreground">{u.linkCount} links</span>
                                </div>
                                <Link href={`/${u.username}`} target="_blank"
                                  className="p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-all flex-shrink-0">
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                              </div>
                            ))}
                          </div>
                        )
                      })()
                  }
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* USERS TAB */}
        {tab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search users by name, email or username…"
                className="flex-1 max-w-sm px-4 py-2.5 rounded-xl bg-secondary/60 border border-border/60 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm transition-all" />
              <button onClick={fetchUsers} className="p-2.5 rounded-xl border border-border/60 hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-all">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {loadingUsers ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>
            ) : (
              <div className="space-y-2">
                {filtered.map(u => (
                  <div key={u.id} className={`flex items-center gap-4 p-4 rounded-2xl border backdrop-blur transition-all ${u.isBanned ? 'bg-destructive/5 border-destructive/30' : 'bg-card/60 border-border/50 hover:border-amber-500/30'}`}>
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{u.name}</span>
                        {u.isAdmin && <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">Admin</span>}
                        {u.isBanned && <span className="text-xs px-1.5 py-0.5 rounded-full bg-destructive/15 text-destructive border border-destructive/20 flex items-center gap-1"><AlertTriangle className="w-2.5 h-2.5" />Banned</span>}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{u.email} · @{u.username}</p>
                      <p className="text-xs text-muted-foreground">{u.linkCount} links · Joined {new Date(u.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Link href={`/${u.username}`} target="_blank"
                        className="p-2 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-all" title="View public profile">
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <button onClick={() => patchUser(u.id, { isBanned: !u.isBanned })}
                        disabled={actionId === u.id || u.isAdmin}
                        className="p-2 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-amber-400 transition-all disabled:opacity-40" title={u.isBanned ? 'Unban user' : 'Ban user'}>
                        {actionId === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : u.isBanned ? <UserCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                      </button>
                      <button onClick={() => patchUser(u.id, { isAdmin: !u.isAdmin })}
                        disabled={actionId === u.id}
                        className="p-2 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-indigo-400 transition-all disabled:opacity-40" title={u.isAdmin ? 'Remove admin' : 'Make admin'}>
                        {u.isAdmin ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                      </button>
                      <button onClick={() => deleteUser(u.id, u.name)}
                        disabled={actionId === u.id || u.isAdmin}
                        className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all disabled:opacity-40" title="Delete user">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <p className="text-center text-muted-foreground py-12 text-sm">No users found</p>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
