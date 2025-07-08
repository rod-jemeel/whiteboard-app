import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { initialDrawingState, DrawingTool } from './drawing-state'

const drawingSlice = createSlice({
  name: 'drawing',
  initialState: initialDrawingState,
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
    setFillShape: (state, action: PayloadAction<boolean>) => {
      state.fillShape = action.payload
    },
    setIsDrawing: (state, action: PayloadAction<boolean>) => {
      state.isDrawing = action.payload
    },
    resetDrawingSettings: (state) => {
      state.selectedTool = 'pen'
      state.selectedColor = '#000000'
      state.strokeWidth = 2
      state.fillShape = false
      state.isDrawing = false
    },
  },
})

export const {
  setSelectedTool,
  setSelectedColor,
  setStrokeWidth,
  setFillShape,
  setIsDrawing,
  resetDrawingSettings,
} = drawingSlice.actions

export default drawingSlice.reducer