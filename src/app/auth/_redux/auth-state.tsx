import { User } from '@supabase/supabase-js'

export interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
}

export const initialAuthState: AuthState = {
  user: null,
  isLoading: true,
  error: null,
}