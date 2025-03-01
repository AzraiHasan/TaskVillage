// server/api/logout.post.ts
export default defineEventHandler(async (event) => {
  // Use the clearUserSession utility from nuxt-auth-utils
  await clearUserSession(event)
  
  return {
    success: true,
    message: 'Logged out successfully'
  }
})