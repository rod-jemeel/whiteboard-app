import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { initialWhiteboardState, Whiteboard, Drawing } from './whiteboard-state'

const whiteboardSlice = createSlice({
  name: 'whiteboard',
  initialState: initialWhiteboardState,
  reducers: {
    setCurrentWhiteboard: (state, action: PayloadAction<Whiteboard | null>) => {
      state.currentWhiteboard = action.payload
    },
    updateCurrentWhiteboard: (state, action: PayloadAction<Partial<Whiteboard>>) => {
      if (state.currentWhiteboard) {
        state.currentWhiteboard = { ...state.currentWhiteboard, ...action.payload }
      }
    },
    setDrawings: (state, action: PayloadAction<Drawing[]>) => {
      state.drawings = action.payload
    },
    addDrawing: (state, action: PayloadAction<Drawing>) => {
      state.drawings.push(action.payload)
    },
    updateDrawing: (state, action: PayloadAction<{ id: string; updates: Partial<Drawing> }>) => {
      const index = state.drawings.findIndex(d => d.id === action.payload.id)
      if (index !== -1) {
        state.drawings[index] = { ...state.drawings[index], ...action.payload.updates }
      }
    },
    removeDrawing: (state, action: PayloadAction<string>) => {
      state.drawings = state.drawings.filter(d => d.id !== action.payload)
    },
    clearDrawings: (state) => {
      state.drawings = []
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const {
  setCurrentWhiteboard,
  updateCurrentWhiteboard,
  setDrawings,
  addDrawing,
  updateDrawing,
  removeDrawing,
  clearDrawings,
  setLoading,
  setError,
} = whiteboardSlice.actions

export default whiteboardSlice.reducer