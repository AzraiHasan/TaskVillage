// composables/useSyncSession.ts
import type { User, WorkspacePermission } from '~/composables/useUser'

export const useSyncSession = () => {
  const { loggedIn, session } = useUserSession()
  const { user, initializeDevUser } = useUser()
  
  const syncSessionData = () => {
    if (loggedIn.value && session.value?.user) {
      // If session exists but no user is loaded in the composable
      if (!user.value) {
        // Map session user data to user composable format
        const sessionUser = session.value.user as any // Use any temporarily to avoid type errors
        
        // Create properly typed user object
        user.value = {
          id: sessionUser.id || '',
          name: sessionUser.name || '',
          email: sessionUser.email || '',
          avatar: sessionUser.avatar || '',
          // Ensure workspacePermissions exists
          workspacePermissions: (sessionUser.workspacePermissions as WorkspacePermission[]) || 
            // Convert legacy format if needed
            (sessionUser.workspaces ? 
              sessionUser.workspaces.map((id: number) => ({ workspaceId: id, role: 'member' as const })) : 
              []),
          roles: sessionUser.roles || ['user']
        } as User
      }
    }
  }
  
  // Watch for session changes to keep user data in sync
  watch(
    () => loggedIn.value && session.value,
    () => syncSessionData(),
    { immediate: true }
  )
  
  return { syncSessionData }
}