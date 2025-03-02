// server/api/login.post.ts
import { z } from 'zod'
import type { UserSessionData } from '~/types/userSessionData'

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  csrfToken: z.string()
})

export default defineEventHandler(async (event) => {
  // Validate the request body
  const { email, password, csrfToken } = await readValidatedBody(event, bodySchema.parse)

  // Validate CSRF token
  if (!validateCsrfToken(event, csrfToken)) {
    throw createError({
      statusCode: 403,
      message: 'Invalid CSRF token'
    })
  }
  
  // For development: hardcoded credentials check
  if (email === 'sarah@taskvillage.dev' && password === 'password123') {
    // Create session data with roles
    const userData: UserSessionData['user'] = {
  id: 'user1',
  name: 'Sarah Chen',
  email: 'sarah@taskvillage.dev',
  avatar: '/placeholder-avatar.png',
  workspacePermissions: [
    { workspaceId: 1, role: 'owner' },
    { workspaceId: 2, role: 'member' }
  ],
  roles: ['user']
}
    
    // Set the user session
    await setUserSession(event, { user: userData })
    
    return { success: true }
  }
  
  // Invalid credentials
  throw createError({
    statusCode: 401,
    message: 'Invalid email or password'
  })
})