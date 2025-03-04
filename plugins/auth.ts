// plugins/auth.ts
export default defineNuxtPlugin(() => {
  // Apply auth middleware globally
  addRouteMiddleware('auth', defineNuxtRouteMiddleware((to) => {
    const user = useSupabaseUser()
    
    // Public routes that don't require authentication 
    const publicRoutes = ['/', '/auth/login', '/auth/register', '/auth/confirm']
    
    // Check if route requires authentication
    if (!publicRoutes.includes(to.path) && !user.value) {
      return navigateTo('/auth/login')
    }
  }), { global: true })
})
