import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { User as SupabaseUser } from '@supabase/supabase-js'

interface AuthState {
  user: SupabaseUser | null
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<SupabaseUser | null>) => {
      state.user = action.payload
      state.error = null
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    logout: (state) => {
      state.user = null
      state.error = null
    }
  }
})

export const { setUser, setLoading, setError, logout } = authSlice.actions
export default authSlice.reducer