'use client'

import { useState, useEffect } from 'react'
import { Stage, Layer, Line, Rect, Circle } from 'react-konva'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { KonvaEventObject } from 'konva/lib/Node'

interface DrawingElement {
  id: string
  type: 'pen' | 'line' | 'rectangle' | 'circle' | 'eraser'
  points?: number[]
  x?: number
  y?: number
  width?: number
  height?: number
  radius?: number
  color: string
  strokeWidth: number
  fill?: string
}

interface CanvasProps {
  drawings: DrawingElement[]
  onDrawingComplete: (drawing: DrawingElement) => void
  stageSize: { width: number; height: number }
}

export function Canvas({ drawings, onDrawingComplete, stageSize }: CanvasProps) {
  const drawingState = useSelector((state: RootState) => state.drawing)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPath, setCurrentPath] = useState<number[]>([])

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    setIsDrawing(true)
    const pos = e.target.getStage()?.getPointerPosition()
    if (!pos) return

    if (drawingState.selectedTool === 'pen' || drawingState.selectedTool === 'eraser') {
      setCurrentPath([pos.x, pos.y])
    } else if (drawingState.selectedTool === 'rectangle' || drawingState.selectedTool === 'circle' || drawingState.selectedTool === 'line') {
      setCurrentPath([pos.x, pos.y, pos.x, pos.y])
    }
  }

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (!isDrawing) return
    
    const stage = e.target.getStage()
    const point = stage?.getPointerPosition()
    if (!point) return

    if (drawingState.selectedTool === 'pen' || drawingState.selectedTool === 'eraser') {
      setCurrentPath([...currentPath, point.x, point.y])
    } else if (drawingState.selectedTool === 'rectangle' || drawingState.selectedTool === 'circle' || drawingState.selectedTool === 'line') {
      setCurrentPath([currentPath[0], currentPath[1], point.x, point.y])
    }
  }

  const handleMouseUp = () => {
    if (!isDrawing) return
    setIsDrawing(false)

    let newDrawing: DrawingElement | null = null

    if (drawingState.selectedTool === 'pen' || drawingState.selectedTool === 'eraser') {
      newDrawing = {
        id: crypto.randomUUID(),
        type: drawingState.selectedTool === 'eraser' ? 'eraser' : 'pen',
        points: currentPath,
        color: drawingState.selectedTool === 'eraser' ? '#FFFFFF' : drawingState.selectedColor,
        strokeWidth: drawingState.strokeWidth
      }
    } else if (drawingState.selectedTool === 'rectangle') {
      const [x1, y1, x2, y2] = currentPath
      newDrawing = {
        id: crypto.randomUUID(),
        type: 'rectangle',
        x: Math.min(x1, x2),
        y: Math.min(y1, y2),
        width: Math.abs(x2 - x1),
        height: Math.abs(y2 - y1),
        color: drawingState.selectedColor,
        strokeWidth: drawingState.strokeWidth,
        fill: drawingState.fill ? drawingState.selectedColor : undefined
      }
    } else if (drawingState.selectedTool === 'circle') {
      const [x1, y1, x2, y2] = currentPath
      const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
      newDrawing = {
        id: crypto.randomUUID(),
        type: 'circle',
        x: x1,
        y: y1,
        radius: radius,
        color: drawingState.selectedColor,
        strokeWidth: drawingState.strokeWidth,
        fill: drawingState.fill ? drawingState.selectedColor : undefined
      }
    } else if (drawingState.selectedTool === 'line') {
      newDrawing = {
        id: crypto.randomUUID(),
        type: 'line',
        points: currentPath,
        color: drawingState.selectedColor,
        strokeWidth: drawingState.strokeWidth
      }
    }

    if (newDrawing) {
      onDrawingComplete(newDrawing)
    }
    
    setCurrentPath([])
  }

  const renderCurrentDrawing = () => {
    if (!isDrawing || currentPath.length < 2) return null

    if (drawingState.selectedTool === 'pen' || drawingState.selectedTool === 'eraser') {
      return (
        <Line
          points={currentPath}
          stroke={drawingState.selectedTool === 'eraser' ? '#FFFFFF' : drawingState.selectedColor}
          strokeWidth={drawingState.strokeWidth}
          lineCap="round"
          lineJoin="round"
          globalCompositeOperation={drawingState.selectedTool === 'eraser' ? 'destination-out' : 'source-over'}
        />
      )
    } else if (drawingState.selectedTool === 'rectangle') {
      const [x1, y1, x2, y2] = currentPath
      return (
        <Rect
          x={Math.min(x1, x2)}
          y={Math.min(y1, y2)}
          width={Math.abs(x2 - x1)}
          height={Math.abs(y2 - y1)}
          stroke={drawingState.selectedColor}
          strokeWidth={drawingState.strokeWidth}
          fill={drawingState.fill ? drawingState.selectedColor : undefined}
        />
      )
    } else if (drawingState.selectedTool === 'circle') {
      const [x1, y1, x2, y2] = currentPath
      const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
      return (
        <Circle
          x={x1}
          y={y1}
          radius={radius}
          stroke={drawingState.selectedColor}
          strokeWidth={drawingState.strokeWidth}
          fill={drawingState.fill ? drawingState.selectedColor : undefined}
        />
      )
    } else if (drawingState.selectedTool === 'line') {
      return (
        <Line
          points={currentPath}
          stroke={drawingState.selectedColor}
          strokeWidth={drawingState.strokeWidth}
          lineCap="round"
        />
      )
    }
  }

  return (
    <Stage
      width={stageSize.width}
      height={stageSize.height}
      onMouseDown={handleMouseDown}
      onMousemove={handleMouseMove}
      onMouseup={handleMouseUp}
      className="bg-white"
    >
      <Layer>
        {drawings.map((drawing) => {
          if (drawing.type === 'pen' || drawing.type === 'line' || drawing.type === 'eraser') {
            return (
              <Line
                key={drawing.id}
                points={drawing.points}
                stroke={drawing.color}
                strokeWidth={drawing.strokeWidth}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={drawing.type === 'eraser' ? 'destination-out' : 'source-over'}
              />
            )
          } else if (drawing.type === 'rectangle') {
            return (
              <Rect
                key={drawing.id}
                x={drawing.x}
                y={drawing.y}
                width={drawing.width}
                height={drawing.height}
                stroke={drawing.color}
                strokeWidth={drawing.strokeWidth}
                fill={drawing.fill}
              />
            )
          } else if (drawing.type === 'circle') {
            return (
              <Circle
                key={drawing.id}
                x={drawing.x}
                y={drawing.y}
                radius={drawing.radius}
                stroke={drawing.color}
                strokeWidth={drawing.strokeWidth}
                fill={drawing.fill}
              />
            )
          }
        })}
        {renderCurrentDrawing()}
      </Layer>
    </Stage>
  )
}