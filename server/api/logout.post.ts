// server/api/logout.post.ts
import { logAuthEvent } from '~/server/utils/auth-logger'
import { getClientIP } from '~/server/utils/rate-limit'

export default defineEventHandler(async (event) => {
  // Get user info before clearing session
  let userId: string | undefined
  try {
    const session = await getUserSession(event)
userId = (session?.user as import('~/composables/useUser').User)?.id
  } catch (err) {
    // If session is invalid or not found, continue without user ID
  }
  
  // Get IP and User-Agent for logging
  const ip = getClientIP(event)
  const userAgent = getRequestHeader(event, 'user-agent') || 'unknown'
  
  // Use the clearUserSession utility from nuxt-auth-utils
  await clearUserSession(event)
  
  // Log the logout event
  await logAuthEvent({
    type: 'logout',
    userId,
    success: true,
    ip,
    userAgent
  })
  
  return {
    success: true,
    message: 'Logged out successfully'
  }
})