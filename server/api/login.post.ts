// server/api/login.post.ts
import { z } from 'zod'

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

export default defineEventHandler(async (event) => {
  // Validate the request body
  const { email, password } = await readValidatedBody(event, bodySchema.parse)
  
  // For development: hardcoded credentials check
  // In a real app, this would query a database
  if (email === 'sarah@taskvillage.dev' && password === 'password123') {
    // Use the auth-utils module to set the user session
    await setUserSession(event, {
      user: {
        id: 'user1',
        name: 'Sarah Chen',
        email: 'sarah@taskvillage.dev',
        avatar: '/placeholder-avatar.png',
        workspaces: [1, 2]
      }
    })
    
    return { success: true }
  }
  
  // Invalid credentials
  throw createError({
    statusCode: 401,
    message: 'Invalid email or password'
  })
})