// server/api/register.post.ts
import { z } from 'zod'
import bcrypt from 'bcrypt'
import type { UserSessionData } from '~/types/userSessionData'

// Define validation schema for registration
const bodySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
})

export default defineEventHandler(async (event) => {
  try {
    // Validate request body
    const { name, email, password } = await readValidatedBody(event, bodySchema.parse)
    
    // Hash the password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Check for duplicate email - in a real app, this would query a database
    // For now, we'll just check against our development user
    if (email === 'sarah@taskvillage.dev') {
      throw createError({
        statusCode: 409,
        message: 'Email already registered'
      })
    }
    
    // In a real app, we would store the user in a database
    // For this demo, we'll log the registration (excluding password)
    console.log(`User registered: ${name}, ${email}`)
    
    // Create a user session right after registration
    const userData: UserSessionData['user'] = {
  id: `user_${Date.now()}`,
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
    
    return {
      success: true,
      message: 'User registered successfully'
    }
  } catch (error: any) {
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