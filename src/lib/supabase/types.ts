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
      whiteboards: {
        Row: {
          id: string
          name: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      drawings: {
        Row: {
          id: string
          whiteboard_id: string
          user_id: string
          type: 'pen' | 'rectangle' | 'circle' | 'line' | 'eraser'
          data: Json
          created_at: string
        }
        Insert: {
          id?: string
          whiteboard_id: string
          user_id: string
          type: 'pen' | 'rectangle' | 'circle' | 'line' | 'eraser'
          data: Json
          created_at?: string
        }
        Update: {
          id?: string
          whiteboard_id?: string
          user_id?: string
          type?: 'pen' | 'rectangle' | 'circle' | 'line' | 'eraser'
          data?: Json
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
  }
}