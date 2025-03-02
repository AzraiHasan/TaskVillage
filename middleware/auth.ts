// middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()
  const { user, initializeDevUser } = useUser()
  
  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register', '/unauthorized']
  
  // Check if the route is public
  if (publicRoutes.includes(to.path)) {
    // If user is already logged in and trying to access login/register
    if (loggedIn.value && (to.path === '/login' || to.path === '/register')) {
      // Check if there's a redirect parameter
      const redirectPath = to.query.redirect?.toString() || '/dashboard'
      return navigateTo(redirectPath)
    }
    return // Allow access to public routes
  }
  
  // For protected routes, check if user is logged in
  if (!loggedIn.value) {
    // Store the original route to redirect back after login
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
  
  // For development environment, initialize user data if needed
  if (!user.value && process.dev) {
    initializeDevUser()
  }

  // Add workspace permission check
  const workspaceId = Number(to.params.workspaceId) || null
  if (workspaceId && user.value) {
    const { hasWorkspaceAccess } = useUser()
    if (!hasWorkspaceAccess(workspaceId)) {
      return navigateTo('/unauthorized')
    }
  }
})