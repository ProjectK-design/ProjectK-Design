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
          user_id: string | null
          habit_type: 'one_time' | 'daily' | 'weekly' | 'monthly' | 'custom'
          recurrence_pattern: Json | null
          calendar_event_id: string | null
          auto_created_from_calendar: boolean
          streak_count: number
          last_completed_date: string | null
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
          user_id?: string | null
          habit_type?: 'one_time' | 'daily' | 'weekly' | 'monthly' | 'custom'
          recurrence_pattern?: Json | null
          calendar_event_id?: string | null
          auto_created_from_calendar?: boolean
          streak_count?: number
          last_completed_date?: string | null
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
          user_id?: string | null
          habit_type?: 'one_time' | 'daily' | 'weekly' | 'monthly' | 'custom'
          recurrence_pattern?: Json | null
          calendar_event_id?: string | null
          auto_created_from_calendar?: boolean
          streak_count?: number
          last_completed_date?: string | null
        }
      }
      habit_completions: {
        Row: {
          id: string
          goal_id: string
          completed_date: string
          completed_at: string
          auto_completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          goal_id: string
          completed_date: string
          completed_at?: string
          auto_completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          goal_id?: string
          completed_date?: string
          completed_at?: string
          auto_completed?: boolean
          created_at?: string
        }
      }
      calendar_connections: {
        Row: {
          id: string
          user_id: string
          calendar_type: 'google' | 'caldav' | 'ics_upload'
          calendar_id: string | null
          access_token: string | null
          refresh_token: string | null
          last_sync_at: string | null
          sync_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          calendar_type: 'google' | 'caldav' | 'ics_upload'
          calendar_id?: string | null
          access_token?: string | null
          refresh_token?: string | null
          last_sync_at?: string | null
          sync_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          calendar_type?: 'google' | 'caldav' | 'ics_upload'
          calendar_id?: string | null
          access_token?: string | null
          refresh_token?: string | null
          last_sync_at?: string | null
          sync_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      calendar_sync_rules: {
        Row: {
          id: string
          user_id: string
          calendar_connection_id: string
          keyword_pattern: string
          category: string | null
          xp_value: number
          habit_type: 'one_time' | 'daily' | 'weekly' | 'monthly' | 'custom'
          auto_create_habits: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          calendar_connection_id: string
          keyword_pattern: string
          category?: string | null
          xp_value?: number
          habit_type?: 'one_time' | 'daily' | 'weekly' | 'monthly' | 'custom'
          auto_create_habits?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          calendar_connection_id?: string
          keyword_pattern?: string
          category?: string | null
          xp_value?: number
          habit_type?: 'one_time' | 'daily' | 'weekly' | 'monthly' | 'custom'
          auto_create_habits?: boolean
          created_at?: string
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

export type HabitCompletion = Database['public']['Tables']['habit_completions']['Row']
export type HabitCompletionInsert = Database['public']['Tables']['habit_completions']['Insert']
export type HabitCompletionUpdate = Database['public']['Tables']['habit_completions']['Update']

export type CalendarConnection = Database['public']['Tables']['calendar_connections']['Row']
export type CalendarConnectionInsert = Database['public']['Tables']['calendar_connections']['Insert']
export type CalendarConnectionUpdate = Database['public']['Tables']['calendar_connections']['Update']

export type CalendarSyncRule = Database['public']['Tables']['calendar_sync_rules']['Row']
export type CalendarSyncRuleInsert = Database['public']['Tables']['calendar_sync_rules']['Insert']
export type CalendarSyncRuleUpdate = Database['public']['Tables']['calendar_sync_rules']['Update']

export type HabitType = 'one_time' | 'daily' | 'weekly' | 'monthly' | 'custom'
export type CalendarType = 'google' | 'caldav' | 'ics_upload'