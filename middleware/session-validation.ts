// server/middleware/session-validation.ts
export default defineEventHandler(async (event) => {
  try {
    // Try to get the user session
    const session = await getUserSession(event)
    
    // If session exists but is invalid, clear it
    if (session && session.user) {
      // Use type checking to validate required properties
      const userObj = session.user as any
      
      if (!userObj || typeof userObj.id !== 'string' || typeof userObj.name !== 'string') {
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