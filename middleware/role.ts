// middleware/role.ts

export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn, user } = useUserSession()
  
  // Check if the route requires a specific role
  const requiredRole = to.meta.requiredRole
  
  // If no specific role is required, allow access
  if (!requiredRole) return
  
  // If user is not logged in, redirect to login
  if (!loggedIn.value) {
    return navigateTo(`/login?redirect=${to.fullPath}`)
  }
  
  // Check if user has the required role
  // For now, we're checking if the role exists in user.roles 
  // (assuming roles would be an array in the user object)
  const hasRole = user.value?.roles?.includes(requiredRole)
  
  // If user doesn't have the required role, redirect to unauthorized page
  if (!hasRole) {
    return navigateTo('/unauthorized')
  }
})