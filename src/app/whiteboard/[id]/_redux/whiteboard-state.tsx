import { Database } from '@/lib/supabase/types'

export type Whiteboard = Database['public']['Tables']['whiteboards']['Row']
export type Drawing = Database['public']['Tables']['drawings']['Row']

export interface WhiteboardState {
  currentWhiteboard: Whiteboard | null
  drawings: Drawing[]
  isLoading: boolean
  error: string | null
}

export const initialWhiteboardState: WhiteboardState = {
  currentWhiteboard: null,
  drawings: [],
  isLoading: false,
  error: null,
}