interface RateLimitEntry {
  attempts: number
  firstAttempt: number
  lastAttempt: number
}

class LRUCache<K, V> {
  private capacity: number
  private cache = new Map<K, V>()

  constructor(capacity: number) {
    this.capacity = capacity
  }

  get(key: K): V | undefined {
    if (this.cache.has(key)) {
      // Move to end (most recently used)
      const value = this.cache.get(key)!
      this.cache.delete(key)
      this.cache.set(key, value)
      return value
    }
    return undefined
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      // Update existing
      this.cache.delete(key)
    } else if (this.cache.size >= this.capacity) {
      // Remove least recently used (first entry)
      const firstKey = this.cache.keys().next().value
      if (firstKey !== undefined) {
        this.cache.delete(firstKey)
      }
    }
    this.cache.set(key, value)
  }

  delete(key: K): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }
}

class RateLimiter {
  private cache: LRUCache<string, RateLimitEntry>
  private maxAttempts: number
  private windowMs: number

  constructor(maxAttempts: number = 5, windowMs: number = 2 * 60 * 1000) { // 2 minutes
    this.cache = new LRUCache<string, RateLimitEntry>(1000) // Store up to 1000 IPs
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
  }

  /**
   * Check if the IP is rate limited
   * @param ip - IP address to check
   * @returns { allowed: boolean, remaining: number, resetTime: number }
   */
  checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const entry = this.cache.get(ip)

    if (!entry) {
      // First attempt
      this.cache.set(ip, {
        attempts: 1,
        firstAttempt: now,
        lastAttempt: now
      })
      return {
        allowed: true,
        remaining: this.maxAttempts - 1,
        resetTime: now + this.windowMs
      }
    }

    // Check if window has expired
    if (now - entry.firstAttempt >= this.windowMs) {
      // Reset window
      this.cache.set(ip, {
        attempts: 1,
        firstAttempt: now,
        lastAttempt: now
      })
      return {
        allowed: true,
        remaining: this.maxAttempts - 1,
        resetTime: now + this.windowMs
      }
    }

    // Within window, check if exceeded
    if (entry.attempts >= this.maxAttempts) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.firstAttempt + this.windowMs
      }
    }

    // Increment attempts
    const newEntry = {
      ...entry,
      attempts: entry.attempts + 1,
      lastAttempt: now
    }
    this.cache.set(ip, newEntry)

    return {
      allowed: true,
      remaining: this.maxAttempts - newEntry.attempts,
      resetTime: entry.firstAttempt + this.windowMs
    }
  }

  /**
   * Reset rate limit for an IP (useful for successful logins)
   * @param ip - IP address to reset
   */
  resetRateLimit(ip: string): void {
    this.cache.delete(ip)
  }

  /**
   * Get current status for an IP without incrementing
   * @param ip - IP address to check
   */
  getStatus(ip: string): { attempts: number; remaining: number; resetTime: number } | null {
    const entry = this.cache.get(ip)
    if (!entry) {
      return null
    }

    const now = Date.now()
    
    // Check if window has expired
    if (now - entry.firstAttempt >= this.windowMs) {
      return null
    }

    return {
      attempts: entry.attempts,
      remaining: Math.max(0, this.maxAttempts - entry.attempts),
      resetTime: entry.firstAttempt + this.windowMs
    }
  }
}

// Singleton instance
const rateLimiter = new RateLimiter(5, 2 * 60 * 1000) // 5 attempts per 2 minutes

export { rateLimiter, RateLimiter }