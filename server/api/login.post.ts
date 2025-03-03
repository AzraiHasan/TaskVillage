// server/api/login.post.ts

// Each log entry includes IP address and user agent information for security analysis.
import { z } from 'zod'
import type { UserSessionData } from '~/types/userSessionData'
import { logAuthEvent } from '~/server/utils/auth-logger'
import { getClientIP } from '~/server/utils/rate-limit'

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  csrfToken: z.string()
})

export default defineEventHandler(async (event) => {
  // Validate the request body
  const { email, password, csrfToken } = await readValidatedBody(event, bodySchema.parse)

  // Get IP and User-Agent for logging
  const ip = getClientIP(event)
  const userAgent = getRequestHeader(event, 'user-agent') || 'unknown'

  // Validate CSRF token
  if (!validateCsrfToken(event, csrfToken)) {
    // Log failed login attempt due to CSRF validation
    await logAuthEvent({
      type: 'login',
      success: false,
      failureReason: 'Invalid CSRF token',
      ip,
      userAgent
    })

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
    
    // Log successful login
    await logAuthEvent({
      type: 'login',
      userId: userData.id,
      success: true,
      ip,
      userAgent
    })
    
    return { success: true }
  }
  
  // Log failed login attempt
  await logAuthEvent({
    type: 'login',
    success: false,
    failureReason: 'Invalid credentials',
    ip,
    userAgent
  })
  
  // Invalid credentials
  throw createError({
    statusCode: 401,
    message: 'Invalid email or password'
  })
})