// server/middleware/session-validation.ts
import type { UserSessionData } from '~/types/userSessionData'

export default defineEventHandler(async (event) => {
  try {
    // Try to get the user session
    const session = await getUserSession(event)
    
    // If session exists but is invalid (missing user data), clear it
    if (session && session.user) {
      const userSession = session as UserSessionData
      if (!userSession.user.id || !userSession.user.name) {
        console.warn('Invalid session detected, clearing session data')
        await clearUserSession(event)
      }
    }
  } catch (error) {
    // If we get here, something went wrong with session processing
    console.error('Session validation error:', error)
    await clearUserSession(event)
  }
})