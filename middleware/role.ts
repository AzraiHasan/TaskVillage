// middleware/role.ts
import { useUserSession } from '#imports'
import type { UserSessionData } from '~/types/userSessionData'

export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn, session } = useUserSession()
  
  // Check if the route requires a specific role
  const requiredRole = to.meta.requiredRole
  
  // If no specific role is required, allow access
  if (!requiredRole) return
  
  // If user is not logged in, redirect to login
  if (!loggedIn.value) {
    return navigateTo(`/login?redirect=${to.fullPath}`)
  }
  
  // Access roles safely with type casting
  const userData = session.value as unknown as UserSessionData | null;
  const userRoles = userData?.user?.roles || []
  const hasRole = userRoles.includes(requiredRole.toString());
  
  // If user doesn't have the required role, redirect to unauthorized page
  if (!hasRole) {
    return navigateTo('/unauthorized')
  }
})