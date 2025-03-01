// composables/useUser.ts
export interface User {
  id: string
  name: string
  email: string
  avatar: string
  workspaces: number[]
}
export const useUser = () => {
  // Create a reactive user state that persists across components
  const user = useState<User | null>('user', () => null)
  const router = useRouter()
  const { clear: clearSession } = useUserSession()

  // Function to set up our development user
  const initializeDevUser = () => {
    console.log('Initializing development user...')
    
    // Define our development user with consistent information
    const devUser: User = {
      id: 'user1',
      name: 'Sarah Chen',
      email: 'sarah@taskvillage.dev',
      avatar: '/placeholder-avatar.png',
      workspaces: [1, 2]
    }

    // Set the user state
    user.value = devUser
    console.log('Development user initialized:', user.value)
  }

  // Function to clear user state (for logout)
  const clearUser = () => {
    user.value = null
  }

  // Logout function
  const logout = async () => {
    try {
      // Call the logout API endpoint
      await $fetch('/api/logout', { method: 'POST' })
      
      // Clear client-side session
      await clearSession()
      
      // Clear local user state
      clearUser()
      
      // Redirect to login page
      return router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      throw error
    }
  }

  // Check if user has access to a specific workspace
  const hasWorkspaceAccess = (workspaceId: number) => {
    return user.value?.workspaces.includes(workspaceId) ?? false
  }

  // Debug helper
  const getCurrentUser = () => {
    console.log('Getting current user:', user.value)
    return user.value
  }

  return {
    user,
    initializeDevUser,
    clearUser,
    hasWorkspaceAccess,
    getCurrentUser,
    logout
  }
}