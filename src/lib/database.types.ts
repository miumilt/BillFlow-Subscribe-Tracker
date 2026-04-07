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
      users: {
        Row: {
          id: string
          telegram_id: number
          username: string | null
          first_name: string
          last_name: string | null
          photo_url: string | null
          currency: string
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          telegram_id: number
          username?: string | null
          first_name: string
          last_name?: string | null
          photo_url?: string | null
          currency?: string
          timezone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          telegram_id?: number
          username?: string | null
          first_name?: string
          last_name?: string | null
          photo_url?: string | null
          currency?: string
          timezone?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          user_id: string | null
          name: string
          icon: string
          color: string
          is_default: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          icon: string
          color: string
          is_default?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          icon?: string
          color?: string
          is_default?: boolean
          sort_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'categories_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          cost: number
          currency: string
          billing_cycle: string
          start_date: string
          next_payment_date: string
          category_id: string | null
          is_active: boolean
          trial_end_date: string | null
          cancel_reminder_days: number | null
          custom_days: number | null
          provider_url: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          cost: number
          currency: string
          billing_cycle: string
          start_date: string
          next_payment_date: string
          category_id?: string | null
          is_active?: boolean
          trial_end_date?: string | null
          cancel_reminder_days?: number | null
          custom_days?: number | null
          provider_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          cost?: number
          currency?: string
          billing_cycle?: string
          start_date?: string
          next_payment_date?: string
          category_id?: string | null
          is_active?: boolean
          trial_end_date?: string | null
          cancel_reminder_days?: number | null
          custom_days?: number | null
          provider_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'subscriptions_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'subscriptions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      payment_records: {
        Row: {
          id: string
          subscription_id: string
          user_id: string
          amount: number
          currency: string
          payment_date: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          subscription_id: string
          user_id: string
          amount: number
          currency: string
          payment_date: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          subscription_id?: string
          user_id?: string
          amount?: number
          currency?: string
          payment_date?: string
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'payment_records_subscription_id_fkey'
            columns: ['subscription_id']
            isOneToOne: false
            referencedRelation: 'subscriptions'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'payment_records_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      notification_preferences: {
        Row: {
          id: string
          user_id: string
          notify_days_before: number
          notify_time: string
          is_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          notify_days_before?: number
          notify_time?: string
          is_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          notify_days_before?: number
          notify_time?: string
          is_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'notification_preferences_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      billing_cycle: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
      currency: 'USD' | 'EUR' | 'RUB' | 'GBP'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
