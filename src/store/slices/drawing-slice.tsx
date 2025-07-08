import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type DrawingTool = 'pen' | 'rectangle' | 'circle' | 'line' | 'eraser'

interface DrawingState {
  selectedTool: DrawingTool
  selectedColor: string
  strokeWidth: number
  fill: boolean
}

const initialState: DrawingState = {
  selectedTool: 'pen',
  selectedColor: '#000000',
  strokeWidth: 2,
  fill: false
}

const drawingSlice = createSlice({
  name: 'drawing',
  initialState,
  reducers: {
    setSelectedTool: (state, action: PayloadAction<DrawingTool>) => {
      state.selectedTool = action.payload
    },
    setSelectedColor: (state, action: PayloadAction<string>) => {
      state.selectedColor = action.payload
    },
    setStrokeWidth: (state, action: PayloadAction<number>) => {
      state.strokeWidth = action.payload
    },
    setFill: (state, action: PayloadAction<boolean>) => {
      state.fill = action.payload
    }
  }
})

export const { setSelectedTool, setSelectedColor, setStrokeWidth, setFill } = drawingSlice.actions
export default drawingSlice.reducer