'use client'

import { useState, useEffect, useRef } from 'react'
import { Stage, Layer, Line, Rect, Circle } from 'react-konva'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { KonvaEventObject } from 'konva/lib/Node'
import Konva from 'konva'

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
  zoom: number
  onZoomChange?: (zoom: number) => void
  canvasTexture?: 'none' | 'grid' | 'dots'
}

export function Canvas({ drawings, onDrawingComplete, stageSize, zoom, onZoomChange, canvasTexture = 'none' }: CanvasProps) {
  const drawingState = useSelector((state: RootState) => state.drawing)
  const gridSize = useSelector((state: RootState) => state.drawing.gridSize)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPath, setCurrentPath] = useState<number[]>([])
  const stageRef = useRef<Konva.Stage>(null)
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [lastPanPos, setLastPanPos] = useState({ x: 0, y: 0 })
  const [isSpacePressed, setIsSpacePressed] = useState(false)

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage()
    if (!stage) return
    
    const pos = stage.getPointerPosition()
    if (!pos) return
    
    // If space is pressed, start panning
    if (isSpacePressed) {
      setIsPanning(true)
      setLastPanPos(pos)
      return
    }
    
    // Otherwise, start drawing
    setIsDrawing(true)
    
    // Adjust for zoom and pan
    const scaledPos = {
      x: (pos.x - stagePos.x) / zoom,
      y: (pos.y - stagePos.y) / zoom
    }

    if (drawingState.selectedTool === 'pen' || drawingState.selectedTool === 'eraser') {
      setCurrentPath([scaledPos.x, scaledPos.y])
    } else if (drawingState.selectedTool === 'rectangle' || drawingState.selectedTool === 'circle' || drawingState.selectedTool === 'line') {
      setCurrentPath([scaledPos.x, scaledPos.y, scaledPos.x, scaledPos.y])
    }
  }

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage()
    const point = stage?.getPointerPosition()
    if (!point) return
    
    // Handle panning
    if (isPanning) {
      const dx = point.x - lastPanPos.x
      const dy = point.y - lastPanPos.y
      
      setStagePos({
        x: stagePos.x + dx,
        y: stagePos.y + dy
      })
      
      setLastPanPos(point)
      return
    }
    
    // Handle drawing
    if (!isDrawing) return
    
    // Adjust for zoom and pan
    const scaledPoint = {
      x: (point.x - stagePos.x) / zoom,
      y: (point.y - stagePos.y) / zoom
    }

    if (drawingState.selectedTool === 'pen' || drawingState.selectedTool === 'eraser') {
      setCurrentPath([...currentPath, scaledPoint.x, scaledPoint.y])
    } else if (drawingState.selectedTool === 'rectangle' || drawingState.selectedTool === 'circle' || drawingState.selectedTool === 'line') {
      setCurrentPath([currentPath[0], currentPath[1], scaledPoint.x, scaledPoint.y])
    }
  }

  const handleMouseUp = () => {
    // Stop panning
    if (isPanning) {
      setIsPanning(false)
      return
    }
    
    // Handle drawing completion
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

  // Handle wheel zoom
  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()
    
    const stage = stageRef.current
    if (!stage) return
    
    const oldScale = zoom
    const pointer = stage.getPointerPosition()
    if (!pointer) return
    
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    }
    
    // Zoom with mouse wheel
    const direction = e.evt.deltaY > 0 ? -1 : 1
    const scaleBy = 1.05
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy
    
    // Limit zoom range
    const finalScale = Math.max(0.1, Math.min(5, newScale))
    
    if (onZoomChange) {
      onZoomChange(finalScale)
    }
    
    const newPos = {
      x: pointer.x - mousePointTo.x * finalScale,
      y: pointer.y - mousePointTo.y * finalScale,
    }
    
    setStagePos(newPos)
  }
  
  // Handle keyboard events for panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        setIsSpacePressed(true)
        if (stageRef.current) {
          stageRef.current.container().style.cursor = 'grab'
        }
      }
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        setIsSpacePressed(false)
        setIsPanning(false)
        if (stageRef.current) {
          stageRef.current.container().style.cursor = 'default'
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])
  
  // Update cursor when panning
  useEffect(() => {
    if (stageRef.current) {
      stageRef.current.container().style.cursor = isPanning ? 'grabbing' : (isSpacePressed ? 'grab' : 'default')
    }
  }, [isPanning, isSpacePressed])
  
  // Render background texture
  const renderBackgroundTexture = () => {
    if (canvasTexture === 'none') return null
    
    const dotSize = 2
    
    // Calculate the visible area with extra padding to avoid seeing edges
    const padding = 1000 // Extra padding to ensure grid extends beyond viewport
    const offsetX = -stagePos.x / zoom - padding
    const offsetY = -stagePos.y / zoom - padding
    const width = (stageSize.width + 2 * padding) / zoom
    const height = (stageSize.height + 2 * padding) / zoom
    
    // Calculate grid start positions to align with grid
    const startX = Math.floor(offsetX / gridSize) * gridSize
    const startY = Math.floor(offsetY / gridSize) * gridSize
    
    if (canvasTexture === 'grid') {
      // Create grid lines
      const lines = []
      
      // Vertical lines
      for (let x = startX; x <= offsetX + width; x += gridSize) {
        lines.push(
          <Line
            key={`v-${x}`}
            points={[x, offsetY, x, offsetY + height]}
            stroke="#e5e7eb"
            strokeWidth={0.5 / zoom} // Adjust stroke width for zoom
          />
        )
      }
      
      // Horizontal lines
      for (let y = startY; y <= offsetY + height; y += gridSize) {
        lines.push(
          <Line
            key={`h-${y}`}
            points={[offsetX, y, offsetX + width, y]}
            stroke="#e5e7eb"
            strokeWidth={0.5 / zoom} // Adjust stroke width for zoom
          />
        )
      }
      
      return lines
    }
    
    if (canvasTexture === 'dots') {
      // Create dot grid
      const dots = []
      
      for (let x = startX; x <= offsetX + width; x += gridSize) {
        for (let y = startY; y <= offsetY + height; y += gridSize) {
          dots.push(
            <Circle
              key={`dot-${x}-${y}`}
              x={x}
              y={y}
              radius={dotSize / zoom} // Adjust dot size for zoom
              fill="#e5e7eb"
            />
          )
        }
      }
      
      return dots
    }
    
    return null
  }

  return (
    <Stage
      ref={stageRef}
      width={stageSize.width}
      height={stageSize.height}
      onMouseDown={handleMouseDown}
      onMousemove={handleMouseMove}
      onMouseup={handleMouseUp}
      onWheel={handleWheel}
      scaleX={zoom}
      scaleY={zoom}
      x={stagePos.x}
      y={stagePos.y}
      draggable={false}
      className="bg-white"
    >
      <Layer>
        {/* White background that scales with zoom */}
        <Rect
          x={-10000}
          y={-10000}
          width={20000}
          height={20000}
          fill="white"
        />
        
        {/* Background texture */}
        {renderBackgroundTexture()}
        
        {/* Drawings */}
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