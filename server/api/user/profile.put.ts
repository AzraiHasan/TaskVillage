// server/api/user/profile.put.ts
import { z } from 'zod'
import type { User } from '~/composables/useUser'

// Define validation schema for profile updates
const updateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  avatar: z.string().optional() // Add avatar field
})

export default defineEventHandler(async (event) => {
  try {
    // Require user to be logged in
    const session = await requireUserSession(event)
    
    // Validate request body
    const { name, email } = await readValidatedBody(event, updateSchema.parse)
    
    // Use type assertion to tell TypeScript about the user structure
    const user = session.user as User
    
    // Now we can safely access the email property
    if (email !== user.email && email === 'sarah@taskvillage.dev') {
      throw createError({
        statusCode: 409,
        message: 'Email is already in use'
      })
    }
    
    // Update the user session with new information
    await setUserSession(event, {
      user: {
        ...user, // Preserve all existing properties
        name,
        email
      }
    })
    
    return {
      success: true,
      message: 'Profile updated successfully'
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