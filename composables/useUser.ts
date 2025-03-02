// composables/useUser.ts

// Define workspace permission roles
export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'guest'

// Define workspace permission structure
export interface WorkspacePermission {
  workspaceId: number
  role: WorkspaceRole
}

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  workspacePermissions: WorkspacePermission[] // Changed from workspaces: number[]
  roles: string[] // Global roles for role-based access control
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
      workspacePermissions: [
        { workspaceId: 1, role: 'owner' },
        { workspaceId: 2, role: 'member' }
      ],
      roles: ['user']
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
    return user.value?.workspacePermissions.some(wp => wp.workspaceId === workspaceId) ?? false
  }

  // Check if user has a specific permission level (or higher) for a workspace
  const hasWorkspacePermission = (workspaceId: number, requiredRole: WorkspaceRole) => {
    if (!user.value) return false
    
    const workspace = user.value.workspacePermissions.find(wp => wp.workspaceId === workspaceId)
    if (!workspace) return false
    
    // Define role hierarchy
    const roleHierarchy = {
      'guest': 0,
      'member': 1,
      'admin': 2,
      'owner': 3
    }
    
    // Check if user's role is sufficient
    return roleHierarchy[workspace.role] >= roleHierarchy[requiredRole]
  }

  // Get all workspaces the user has access to
  const getUserWorkspaces = () => {
    if (!user.value) return []
    return user.value.workspacePermissions.map(wp => wp.workspaceId)
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
    hasWorkspacePermission,
    getUserWorkspaces,
    getCurrentUser,
    logout
  }
}