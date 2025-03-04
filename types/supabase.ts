// types/supabase.ts
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          avatar: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          avatar?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          avatar?: string
          updated_at?: string
        }
      },
      workspaces: {
        Row: {
          id: number
          name: string
          description: string | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          name?: string
          description?: string | null
          created_by?: string | null
        }
      },
      workspace_members: {
        Row: {
          workspace_id: number
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          workspace_id: number
          user_id: string
          role?: string
          joined_at?: string
        }
        Update: {
          role?: string
        }
      }
      tasks: {
   Row: {
     id: number
     title: string
     description: string | null
     type: 'public' | 'private'
     priority: 'low' | 'medium' | 'high'
     status: 'not_started' | 'in_progress' | 'in_review' | 'completed' | 'canceled'
     progress: number
     due_date: string | null
     assignee_id: string | null
     workspace_id: number
     created_by: string | null
     created_at: string
     updated_at: string
   }
   Insert: {
     id?: number
     title: string
     description?: string | null
     type: 'public' | 'private'
     priority: 'low' | 'medium' | 'high'
     status?: 'not_started' | 'in_progress' | 'in_review' | 'completed' | 'canceled'
     progress?: number
     due_date?: string | null
     assignee_id?: string | null
     workspace_id: number
     created_by?: string | null
     created_at?: string
     updated_at?: string
   }
   Update: {
     title?: string
     description?: string | null
     type?: 'public' | 'private'
     priority?: 'low' | 'medium' | 'high'
     status?: 'not_started' | 'in_progress' | 'in_review' | 'completed' | 'canceled'
     progress?: number
     due_date?: string | null
     assignee_id?: string | null
     workspace_id?: number
     updated_at?: string
   }
 }
    }
  }
  
}