// middleware/role.ts
import { useUserSession } from '#imports'

// Type guard to check if user has roles
function hasRoles(user: any): user is { roles: string[] } {
  return user && Array.isArray(user.roles);
}

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
  
  // Use type guard to safely get roles
  const user = session.value?.user
  const userRoles: string[] = hasRoles(user) ? user.roles : []
  
  // Make sure requiredRole is treated as a string for comparison
  const roleToCheck = String(requiredRole)
  const hasRole = userRoles.includes(roleToCheck)
  
  // If user doesn't have the required role, redirect to unauthorized page
  if (!hasRole) {
    return navigateTo('/unauthorized')
  }
})