// server/utils/rate-limit.ts
import { H3Event } from 'h3'

// Updated type definition to include the limit property
interface RateLimitData {
  count: number;
  resetTime: number;
  limit: number;
}

// In-memory store for rate limiting (would use Redis in production)
const rateLimitStore = new Map<string, RateLimitData>()

/**
 * Simple rate limiting utility
 * @param key Unique key for rate limiting (usually IP + endpoint)
 * @param limit Maximum number of requests allowed in the time window
 * @param windowMs Time window in milliseconds
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<{
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const now = Date.now()
  const current = rateLimitStore.get(key)
  
  if (!current || current.resetTime <= now) {
    const resetTime = now + windowMs
    rateLimitStore.set(key, {
      count: 1,
      resetTime,
      limit
    })
    return { allowed: true, limit, remaining: limit - 1, reset: resetTime }
  }
  
  // Update the limit value in case it changed
  current.limit = limit
  
  const remaining = Math.max(0, limit - current.count)
  const allowed = remaining > 0
  
  if (allowed) {
    current.count++
  }
  
  return {
    allowed,
    limit,
    remaining: Math.max(0, remaining - (allowed ? 1 : 0)),
    reset: current.resetTime
  }
}

/**
 * Get client IP address from request
 */
export function getClientIP(event: H3Event): string {
  return getRequestHeader(event, 'x-forwarded-for') || 
         event.node.req.socket.remoteAddress || 
         'unknown'
}

/**
 * Get rate limit info for a key
 */
export function getRateLimitInfo(key: string): {
  limit: number;
  remaining: number;
  reset: number;
} | null {
  const current = rateLimitStore.get(key)
  if (!current) return null
  
  return {
    limit: current.limit,
    remaining: Math.max(0, current.limit - current.count),
    reset: current.resetTime
  }
}