export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      goals: {
        Row: {
          id: string
          title: string
          description: string | null
          target_value: number
          current_value: number
          unit: string
          category: string | null
          deadline: string | null
          created_at: string
          updated_at: string
          completed: boolean
          xp_value: number
          xp_earned: number
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          target_value: number
          current_value?: number
          unit: string
          category?: string | null
          deadline?: string | null
          created_at?: string
          updated_at?: string
          completed?: boolean
          xp_value?: number
          xp_earned?: number
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          target_value?: number
          current_value?: number
          unit?: string
          category?: string | null
          deadline?: string | null
          created_at?: string
          updated_at?: string
          completed?: boolean
          xp_value?: number
          xp_earned?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Goal = Database['public']['Tables']['goals']['Row']
export type GoalInsert = Database['public']['Tables']['goals']['Insert']
export type GoalUpdate = Database['public']['Tables']['goals']['Update']