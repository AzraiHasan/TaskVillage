// server/api/user/avatar.post.ts
import { readMultipartFormData } from 'h3'
import { randomUUID } from 'node:crypto'
import { writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import type { User } from '~/composables/useUser'

export default defineEventHandler(async (event) => {
  // Require user to be logged in
  const session = await requireUserSession(event)
  
  try {
    // Parse multipart form data
    const formData = await readMultipartFormData(event)
    
    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'No file uploaded'
      })
    }
    
    // Get the file part (assuming it's the first file with field name 'avatar')
    const filePart = formData.find(part => part.name === 'avatar')
    
    if (!filePart || !filePart.data) {
      throw createError({
        statusCode: 400,
        message: 'Avatar file is missing'
      })
    }
    
    // Check file type using the content type
    const contentType = filePart.type || ''
    if (!contentType.startsWith('image/')) {
      throw createError({
        statusCode: 400,
        message: 'Uploaded file must be an image'
      })
    }
    
    // Get file extension from content type
    const extension = contentType.split('/')[1] || 'png'
    
    // Create unique filename
    const filename = `avatar-${randomUUID()}.${extension}`
    
    // Ensure uploads directory exists
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadsDir, { recursive: true })
    
    // Save file to public directory
    const filePath = join(uploadsDir, filename)
    await writeFile(filePath, filePart.data)
    
    // Update user session with new avatar
    const user = session.user as User
    const avatarUrl = `/uploads/${filename}`
    
    await setUserSession(event, {
      user: {
        ...user,
        avatar: avatarUrl
      }
    })
    
    return {
      success: true,
      avatar: avatarUrl
    }
  } catch (error: any) {
    console.error('Avatar upload error:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to upload avatar'
    })
  }
})