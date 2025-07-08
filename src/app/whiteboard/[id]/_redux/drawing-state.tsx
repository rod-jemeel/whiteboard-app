export type DrawingTool = 'pen' | 'rectangle' | 'circle' | 'line' | 'eraser'

export interface DrawingState {
  selectedTool: DrawingTool
  selectedColor: string
  strokeWidth: number
  fillShape: boolean
  isDrawing: boolean
}

export const initialDrawingState: DrawingState = {
  selectedTool: 'pen',
  selectedColor: '#000000',
  strokeWidth: 2,
  fillShape: false,
  isDrawing: false,
}