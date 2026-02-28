/**
 * In-memory sliding window rate limiter.
 * Suitable for single-process deployments (PM2 single instance).
 * For multi-instance, swap to Redis-backed implementation.
 */

interface RateLimitEntry {
  timestamps: number[]
}

interface RateLimiterOptions {
  /** Max requests allowed within the window */
  limit: number
  /** Window size in milliseconds */
  windowMs: number
}

const stores = new Map<string, Map<string, RateLimitEntry>>()

export function createRateLimiter(name: string, options: RateLimiterOptions) {
  // Each limiter gets its own store keyed by name
  if (!stores.has(name)) {
    stores.set(name, new Map())
  }
  const store = stores.get(name)!

  // Periodically clean up stale entries (every 60s)
  const CLEANUP_INTERVAL = 60_000
  let lastCleanup = Date.now()

  function cleanup() {
    const now = Date.now()
    if (now - lastCleanup < CLEANUP_INTERVAL) return
    lastCleanup = now

    const cutoff = now - options.windowMs
    for (const [key, entry] of store) {
      entry.timestamps = entry.timestamps.filter((t) => t > cutoff)
      if (entry.timestamps.length === 0) store.delete(key)
    }
  }

  return {
    /**
     * Check if a request should be allowed for the given key.
     * Returns { allowed, remaining, retryAfterMs }
     */
    check(key: string): {
      allowed: boolean
      remaining: number
      retryAfterMs: number
    } {
      cleanup()

      const now = Date.now()
      const cutoff = now - options.windowMs
      const entry = store.get(key) || { timestamps: [] }

      // Remove expired timestamps
      entry.timestamps = entry.timestamps.filter((t) => t > cutoff)

      if (entry.timestamps.length >= options.limit) {
        // Rate limited — compute when the oldest request in the window expires
        const oldestInWindow = entry.timestamps[0]
        const retryAfterMs = oldestInWindow + options.windowMs - now

        return {
          allowed: false,
          remaining: 0,
          retryAfterMs: Math.max(retryAfterMs, 1000),
        }
      }

      // Allow and record
      entry.timestamps.push(now)
      store.set(key, entry)

      return {
        allowed: true,
        remaining: options.limit - entry.timestamps.length,
        retryAfterMs: 0,
      }
    },
  }
}
