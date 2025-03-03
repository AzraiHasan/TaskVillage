// server/api/register.post.ts
import { z } from 'zod'
import bcrypt from 'bcrypt'
import { validateCsrfToken } from '~/server/utils/csrf'
import { createPasswordSchema } from '~/server/utils/password-validation'
import { logAuthEvent } from '~/server/utils/auth-logger'
import { getClientIP } from '~/server/utils/rate-limit'
import type { UserSessionData } from '~/types/userSessionData'

// Define validation schema for registration
const bodySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: createPasswordSchema(),
  csrfToken: z.string()
})

export default defineEventHandler(async (event) => {
  // Get IP and User-Agent for logging
  const ip = getClientIP(event)
  const userAgent = getRequestHeader(event, 'user-agent') || 'unknown'
  
  try {
    // Validate request body
    const { name, email, password, csrfToken } = await readValidatedBody(event, bodySchema.parse)
    
    // Validate CSRF token
    if (!validateCsrfToken(event, csrfToken)) {
      // Log failed registration attempt due to CSRF validation
      await logAuthEvent({
        type: 'register',
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
    
    // Hash the password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Check for duplicate email - in a real app, this would query a database
    // For now, we'll just check against our development user
    if (email === 'sarah@taskvillage.dev') {
      // Log failed registration due to duplicate email
      await logAuthEvent({
        type: 'register',
        success: false,
        failureReason: 'Email already registered',
        ip,
        userAgent
      })
      
      throw createError({
        statusCode: 409,
        message: 'Email already registered'
      })
    }
    
    // In a real app, we would store the user in a database
    // For this demo, we'll log the registration (excluding password)
    console.log(`User registered: ${name}, ${email}`)
    
    // Generate a unique user ID
    const userId = `user_${Date.now()}`
    
    // Create a user session right after registration
    const userData: UserSessionData['user'] = {
      id: userId,
      name,
      email,
      avatar: '/placeholder-avatar.png',
      workspacePermissions: [
        { workspaceId: 1, role: 'member' },
        { workspaceId: 2, role: 'member' }
      ],
      roles: ['user']
    }
    
    await setUserSession(event, { user: userData })
    
    // Log successful registration
    await logAuthEvent({
      type: 'register',
      userId,
      success: true,
      ip,
      userAgent
    })
    
    return {
      success: true,
      message: 'User registered successfully'
    }
  } catch (error: any) {
    // Log registration error
    const failureReason = error.statusCode === 409 
      ? 'Email already registered'
      : error.name === 'ZodError'
        ? 'Validation error'
        : 'Registration failed'
    
    await logAuthEvent({
      type: 'register',
      success: false,
      failureReason,
      ip,
      userAgent
    })
    
    // Handle validation errors
    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        message: 'Validation error',
        data: error.errors
      })
    }
    // Re-throw any other errors
    throw error
  }
})