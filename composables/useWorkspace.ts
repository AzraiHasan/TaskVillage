// composables/useWorkspace.ts
import type { Database } from '~/types/supabase'

type Workspace = Database['public']['Tables']['workspaces']['Row']
type WorkspaceMember = Database['public']['Tables']['workspace_members']['Row'] & {
  profiles?: {
    name: string
    avatar: string
  }
}

export const useWorkspace = () => {
  const client = useSupabaseClient<Database>()
  const user = useSupabaseUser()

  // Get all workspaces for the current user
  const getUserWorkspaces = async (): Promise<Workspace[]> => {
    if (!user.value) return []
    
    const { data, error } = await client
      .from('workspaces')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data || []
  }

  // Get members of a workspace
  const getWorkspaceMembers = async (workspaceId: number): Promise<WorkspaceMember[]> => {
    const { data, error } = await client
      .from('workspace_members')
      .select(`
        *,
        profiles:user_id (
          name,
          avatar
        )
      `)
      .eq('workspace_id', workspaceId)
    
    if (error) throw error
    return data || []
  }

  // Check if user is a member of a workspace
  const checkWorkspaceMembership = async (workspaceId: number): Promise<boolean> => {
    if (!user.value) return false
    
    const { data, error } = await client
      .from('workspace_members')
      .select('workspace_id')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.value.id)
      .maybeSingle()
    
    if (error) throw error
    return !!data
  }

  return {
    getUserWorkspaces,
    getWorkspaceMembers,
    checkWorkspaceMembership
  }
}