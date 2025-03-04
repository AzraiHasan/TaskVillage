// composables/useTaskDatabase.ts
import type { Database } from '~/types/supabase'

type Task = Database['public']['Tables']['tasks']['Row']
type TaskInsert = Database['public']['Tables']['tasks']['Insert']
type TaskUpdate = Database['public']['Tables']['tasks']['Update']

export const useTaskDatabase = () => {
  const client = useSupabaseClient<Database>()
  const user = useSupabaseUser()

  // Get tasks for a workspace
  const getWorkspaceTasks = async (workspaceId: number): Promise<Task[]> => {
    const { data, error } = await client
      .from('tasks')
      .select(`
        *,
        assignee:assignee_id (
          id,
          profiles (
            name,
            avatar
          )
        )
      `)
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  // Create a new task
  const createTask = async (task: TaskInsert): Promise<Task> => {
    if (!user.value) throw new Error('User must be logged in')
    
    const newTask = {
      ...task,
      created_by: user.value.id,
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await client
      .from('tasks')
      .insert(newTask)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Update a task
  const updateTask = async (id: number, updates: TaskUpdate): Promise<Task> => {
    const updatedFields = {
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await client
      .from('tasks')
      .update(updatedFields)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Delete a task
  const deleteTask = async (id: number): Promise<void> => {
    const { error } = await client
      .from('tasks')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  return {
    getWorkspaceTasks,
    createTask,
    updateTask,
    deleteTask
  }
}