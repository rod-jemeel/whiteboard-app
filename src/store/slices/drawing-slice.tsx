import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type DrawingTool = 'pen' | 'rectangle' | 'circle' | 'line' | 'eraser'
export type CanvasTexture = 'none' | 'grid' | 'dots'

interface DrawingState {
  selectedTool: DrawingTool
  selectedColor: string
  strokeWidth: number
  fill: boolean
  zoom: number
  history: unknown[][]
  historyIndex: number
  canvasTexture: CanvasTexture
  gridSize: number
}

const initialState: DrawingState = {
  selectedTool: 'pen',
  selectedColor: '#000000',
  strokeWidth: 2,
  fill: false,
  zoom: 1,
  history: [],
  historyIndex: -1,
  canvasTexture: 'none',
  gridSize: 20
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
    },
    setZoom: (state, action: PayloadAction<number>) => {
      state.zoom = action.payload
    },
    resetZoom: (state) => {
      state.zoom = 1
    },
    addToHistory: (state, action: PayloadAction<unknown[]>) => {
      // Remove any history after current index
      state.history = state.history.slice(0, state.historyIndex + 1)
      // Add new state to history
      state.history.push(action.payload)
      state.historyIndex = state.history.length - 1
    },
    undo: (state) => {
      if (state.historyIndex > 0) {
        state.historyIndex -= 1
      }
    },
    redo: (state) => {
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex += 1
      }
    },
    setCanvasTexture: (state, action: PayloadAction<CanvasTexture>) => {
      state.canvasTexture = action.payload
    },
    setGridSize: (state, action: PayloadAction<number>) => {
      state.gridSize = action.payload
    }
  }
})

export const { setSelectedTool, setSelectedColor, setStrokeWidth, setFill, setZoom, resetZoom, addToHistory, undo, redo, setCanvasTexture, setGridSize } = drawingSlice.actions
export default drawingSlice.reducer