// server/middleware/rate-limit.ts

// This middleware will only apply rate limiting to login and register endpoints with appropriate limits for each: 5 attempts per 5 minutes for login and 3 attempts per 10 minutes for registration.

import { defineEventHandler, createError } from 'h3'
import { rateLimit, getClientIP } from '~/server/utils/rate-limit'

export default defineEventHandler(async (event) => {
  const path = getRequestPath(event)
  
  // Apply rate limiting only to auth endpoints
  if (path.startsWith('/api/login') || path.startsWith('/api/register')) {
    const ip = getClientIP(event)
    const key = `${ip}:${path}`
    
    const limit = path.includes('login') ? 5 : 3
    const windowMs = path.includes('login') ? 5 * 60 * 1000 : 10 * 60 * 1000
    
    const result = await rateLimit(key, limit, windowMs)
    
    // Set rate limit headers
    setResponseHeaders(event, {
      'X-RateLimit-Limit': String(result.limit),
      'X-RateLimit-Remaining': String(result.remaining),
      'X-RateLimit-Reset': String(Math.ceil(result.reset / 1000)) // Unix timestamp in seconds
    })
    
    if (!result.allowed) {
      throw createError({
        statusCode: 429,
        message: 'Too many requests, please try again later'
      })
    }
  }
})