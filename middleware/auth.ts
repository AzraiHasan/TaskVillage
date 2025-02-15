// middleware/auth.ts
import { useUser } from '~/composables/useUser'

export default defineNuxtRouteMiddleware((to) => {
  // Get our user management functions
  const { user, initializeDevUser } = useUser()
  
  // Public routes that don't require authentication
  const publicRoutes = ['/']
  
  // During development, set up our mock user if none exists
  if (!user.value) {
    initializeDevUser()
  }

  // Check if route requires authentication
  if (!publicRoutes.includes(to.path) && !user.value) {
    return navigateTo('/')
  }
})