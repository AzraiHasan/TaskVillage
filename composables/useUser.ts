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

      // Validate workspace permissions
      if (!devUser.workspacePermissions || devUser.workspacePermissions.length === 0) {
        console.error('User initialization failed: No workspace permissions')
        throw new Error('Invalid user configuration')
      }

      // Set the user state
      user.value = devUser
      console.log('Development user initialized:', user.value)
    } catch (error) {
      console.error('User initialization error:', error)
      // Reset user state to null in case of initialization failure
      user.value = null
    }
  }
}