// composables/useProfile.ts
import type { Database } from '~/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export const useProfile = () => {
  const client = useSupabaseClient<Database>()
  const user = useSupabaseUser()

  // Get the current user's profile
  const getCurrentProfile = async (): Promise<Profile | null> => {
    if (!user.value) return null
    
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', user.value.id)
      .single()
    
    if (error) throw error
    return data
  }

  // Update the current user's profile
  const updateProfile = async (updates: ProfileUpdate): Promise<Profile> => {
    if (!user.value) throw new Error('Not authenticated')
    
    const { data, error } = await client
      .from('profiles')
      .update(updates)
      .eq('id', user.value.id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  return {
    getCurrentProfile,
    updateProfile
  }
}