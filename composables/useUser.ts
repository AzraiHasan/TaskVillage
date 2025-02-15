// composables/useUser.ts

// Define our user type for type safety throughout the application
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
    getCurrentUser
  }
}