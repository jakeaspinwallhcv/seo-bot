/**
 * Simple in-memory rate limiter for API endpoints
 *
 * NOTE: This is a basic implementation using in-memory Map.
 * For production with multiple instances, consider using Redis with Upstash.
 *
 * Usage:
 *   const limiter = createRateLimiter({ requests: 10, window: 60000 })
 *   const isAllowed = limiter.check('user-id', 'endpoint-key')
 */

type RateLimitConfig = {
  requests: number  // Max requests per window
  window: number    // Time window in milliseconds
}

type RateLimitEntry = {
  count: number
  resetAt: number
}

class RateLimiter {
  private config: RateLimitConfig
  private store: Map<string, RateLimitEntry>

  constructor(config: RateLimitConfig) {
    this.config = config
    this.store = new Map()

    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60000)
  }

  /**
   * Check if request is allowed under rate limit
   * Returns { allowed: boolean, remaining: number, resetAt: number }
   */
  check(userId: string, endpoint: string): {
    allowed: boolean
    remaining: number
    resetAt: number
  } {
    const key = `${userId}:${endpoint}`
    const now = Date.now()
    const entry = this.store.get(key)

    // No entry or expired entry - allow and create new
    if (!entry || now >= entry.resetAt) {
      const resetAt = now + this.config.window
      this.store.set(key, { count: 1, resetAt })
      return {
        allowed: true,
        remaining: this.config.requests - 1,
        resetAt,
      }
    }

    // Entry exists and not expired
    if (entry.count < this.config.requests) {
      entry.count++
      return {
        allowed: true,
        remaining: this.config.requests - entry.count,
        resetAt: entry.resetAt,
      }
    }

    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    }
  }

  /**
   * Clean up expired entries to prevent memory leaks
   */
  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.resetAt) {
        this.store.delete(key)
      }
    }
  }

  /**
   * Get current usage for a user/endpoint
   */
  getUsage(userId: string, endpoint: string): {
    count: number
    resetAt: number
  } | null {
    const key = `${userId}:${endpoint}`
    const entry = this.store.get(key)

    if (!entry || Date.now() >= entry.resetAt) {
      return null
    }

    return {
      count: entry.count,
      resetAt: entry.resetAt,
    }
  }

  /**
   * Reset rate limit for a user/endpoint
   */
  reset(userId: string, endpoint: string) {
    const key = `${userId}:${endpoint}`
    this.store.delete(key)
  }
}

/**
 * Create a rate limiter with specific configuration
 */
export function createRateLimiter(config: RateLimitConfig): RateLimiter {
  return new RateLimiter(config)
}

/**
 * Predefined rate limiters for different endpoint categories
 */
export const rateLimiters = {
  // Expensive AI operations - very restrictive
  expensive: createRateLimiter({
    requests: 3,      // 3 requests
    window: 60000,    // per minute
  }),

  // Analysis operations - moderately restrictive
  analysis: createRateLimiter({
    requests: 10,     // 10 requests
    window: 60000,    // per minute
  }),

  // Standard API operations
  standard: createRateLimiter({
    requests: 60,     // 60 requests
    window: 60000,    // per minute (1 req/sec average)
  }),

  // Unrestricted (for GET endpoints with cached data)
  relaxed: createRateLimiter({
    requests: 300,    // 300 requests
    window: 60000,    // per minute (5 req/sec average)
  }),
}

/**
 * Helper to format rate limit headers
 */
export function getRateLimitHeaders(result: {
  allowed: boolean
  remaining: number
  resetAt: number
}): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(result.allowed ? result.remaining + 1 : 0),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)), // Unix timestamp
  }
}
