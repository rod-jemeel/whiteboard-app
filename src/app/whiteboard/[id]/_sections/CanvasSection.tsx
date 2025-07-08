'use client'

import { useEffect, useRef } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { setIsDrawing } from '@/app/whiteboard/[id]/_redux/drawing-slice'

export function CanvasSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dispatch = useAppDispatch()
  const { selectedTool, selectedColor, strokeWidth, fillShape, isDrawing } = useAppSelector((state) => state.drawing)
  const { currentWhiteboard } = useAppSelector((state) => state.whiteboard)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    
    // Drawing logic would go here
    
  }, [])
  
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    dispatch(setIsDrawing(true))
    // Start drawing logic
  }
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    // Continue drawing logic
  }
  
  const handleMouseUp = () => {
    dispatch(setIsDrawing(false))
    // End drawing logic
  }
  
  return (
    <div className="flex-1 p-4">
      <canvas
        ref={canvasRef}
        className="w-full h-full bg-white border rounded-lg cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  )
}