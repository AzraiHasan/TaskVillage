// server/api/user/profile.get.ts
export default defineEventHandler(async (event) => {
  // This will throw a 401 error if the user is not authenticated
  const session = await requireUserSession(event)
  
  // The session contains the user data we stored during login
  return session.user
})