'use client'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setSelectedTool, setSelectedColor, setStrokeWidth, setFillShape } from '@/app/whiteboard/[id]/_redux/drawing-slice'
import { DrawingTool } from '@/app/whiteboard/[id]/_redux/drawing-state'

export function DrawingTools() {
  const dispatch = useAppDispatch()
  const { selectedTool, selectedColor, strokeWidth, fillShape } = useAppSelector((state) => state.drawing)
  
  const tools: DrawingTool[] = ['pen', 'rectangle', 'circle', 'line', 'eraser']
  
  return (
    <div className="flex items-center gap-4 p-4 bg-white shadow-md rounded-lg">
      <div className="flex gap-2">
        {tools.map((tool) => (
          <button
            key={tool}
            onClick={() => dispatch(setSelectedTool(tool))}
            className={`px-3 py-2 rounded ${
              selectedTool === tool
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {tool.charAt(0).toUpperCase() + tool.slice(1)}
          </button>
        ))}
      </div>
      
      <div className="flex items-center gap-2">
        <label>Color:</label>
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => dispatch(setSelectedColor(e.target.value))}
          className="w-10 h-10 border rounded cursor-pointer"
        />
      </div>
      
      <div className="flex items-center gap-2">
        <label>Width:</label>
        <input
          type="range"
          min="1"
          max="20"
          value={strokeWidth}
          onChange={(e) => dispatch(setStrokeWidth(Number(e.target.value)))}
          className="w-24"
        />
        <span>{strokeWidth}px</span>
      </div>
      
      {(selectedTool === 'rectangle' || selectedTool === 'circle') && (
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={fillShape}
            onChange={(e) => dispatch(setFillShape(e.target.checked))}
          />
          Fill shape
        </label>
      )}
    </div>
  )
}