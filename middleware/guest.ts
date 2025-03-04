// middleware/guest.ts
import { useUser } from '~/composables/useUser'

export default defineNuxtRouteMiddleware((to, from) => {
  // Get our user management functions
  const { user } = useUser()
  
  // If user is already authenticated, redirect to dashboard
  if (user.value) {
    return navigateTo('/dashboard')
  }
})