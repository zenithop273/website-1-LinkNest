// Simple in-memory rate limiter (resets on server restart — good enough for Workers)
const store = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = store.get(key)
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true // allowed
  }
  if (entry.count >= limit) return false // blocked
  entry.count++
  return true // allowed
}

// Cleanup old entries periodically to avoid memory leak
setInterval(() => {
  const now = Date.now()
  for (const [k, v] of store) { if (now > v.resetAt) store.delete(k) }
}, 60_000)
