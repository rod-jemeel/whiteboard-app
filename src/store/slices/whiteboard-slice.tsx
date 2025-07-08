import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Whiteboard {
  id: string
  name: string
  user_id: string
  created_at: string
  updated_at: string
  invite_code?: string
}

interface WhiteboardState {
  currentWhiteboard: Whiteboard | null
  isLoading: boolean
}

const initialState: WhiteboardState = {
  currentWhiteboard: null,
  isLoading: false
}

const whiteboardSlice = createSlice({
  name: 'whiteboard',
  initialState,
  reducers: {
    setWhiteboard: (state, action: PayloadAction<Whiteboard>) => {
      state.currentWhiteboard = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    }
  }
})

export const { setWhiteboard, setLoading } = whiteboardSlice.actions
export default whiteboardSlice.reducer