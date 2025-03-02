// composables/useUser.ts

// Define workspace permission roles
export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'guest'

// Define workspace permission structure with enhanced type safety
export interface WorkspacePermission {
  workspaceId: number
  role: WorkspaceRole
}

// Enhanced User interface with more comprehensive type definitions
export interface User {
  id: string
  name: string
  email: string
  avatar: string
  workspacePermissions: WorkspacePermission[]
  roles: string[]
}

export const useUser = (): {
  user: Ref<User | null>
  initializeDevUser: () => void
  getCurrentUser: () => User | null
  hasWorkspaceAccess: (workspaceId: number) => boolean
  hasWorkspacePermission: (workspaceId: number, minRole: WorkspaceRole) => boolean
  logout: () => Promise<void>
} => {
  // Create a reactive user state that persists across components
  const user = useState<User | null>('user', () => null)
  const router = useRouter()
  const { clear: clearSession } = useUserSession()

  // Type guard to validate workspace permissions
  const isValidWorkspacePermission = (permission: any): permission is WorkspacePermission => {
    return (
      typeof permission === 'object' &&
      typeof permission.workspaceId === 'number' &&
      ['owner', 'admin', 'member', 'guest'].includes(permission.role)
    )
  }

  // Function to set up our development user
  const initializeDevUser = () => {
    try {
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

      // Validate workspace permissions using the type guard
      if (!devUser.workspacePermissions || 
          !devUser.workspacePermissions.every(isValidWorkspacePermission)) {
        console.error('User initialization failed: Invalid workspace permissions')
        throw new Error('Invalid user configuration')
      }

      // Set the user state
      user.value = devUser
      console.log('Development user initialized:', user.value)

      return devUser
    } catch (error) {
      console.error('User initialization error:', error)
      // Reset user state to null in case of initialization failure
      user.value = null
      throw error
    }
  }

  // Function to get current user
const getCurrentUser = () => {
  return user.value
}

// Function to handle user logout
const logout = async (): Promise<void> => {
  try {
    // Call the server logout endpoint
    await $fetch('/api/logout', { method: 'POST' })
    
    // Clear user state
    user.value = null
    
    // Clear session
    await clearSession()
    
    // Redirect to login page
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
    throw error
  }
}

  // Function to check if user has access to a workspace
const hasWorkspaceAccess = (workspaceId: number): boolean => {
  if (!user.value) return false
  return user.value.workspacePermissions.some(wp => wp.workspaceId === workspaceId)
}

  // Function to check if user has specific permission in a workspace
const hasWorkspacePermission = (workspaceId: number, minRole: WorkspaceRole): boolean => {
  if (!user.value) return false
  
  const permission = user.value.workspacePermissions.find(wp => wp.workspaceId === workspaceId)
  if (!permission) return false
  
  // Check if role meets minimum requirement
  const roles: WorkspaceRole[] = ['guest', 'member', 'admin', 'owner']
  const userRoleIndex = roles.indexOf(permission.role)
  const requiredRoleIndex = roles.indexOf(minRole)
  
  return userRoleIndex >= requiredRoleIndex
}

  return {
  user,
  initializeDevUser,
  getCurrentUser,
  hasWorkspaceAccess,
  hasWorkspacePermission,
  logout
}
}