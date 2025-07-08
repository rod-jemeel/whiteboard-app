import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Whiteboard {
  id: string
  name: string
  user_id: string
  created_at: string
  updated_at: string
}

interface DashboardState {
  whiteboards: Whiteboard[]
  isLoading: boolean
}

const initialState: DashboardState = {
  whiteboards: [],
  isLoading: false
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setWhiteboards: (state, action: PayloadAction<Whiteboard[]>) => {
      state.whiteboards = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    }
  }
})

export const { setWhiteboards, setLoading } = dashboardSlice.actions
export default dashboardSlice.reducer