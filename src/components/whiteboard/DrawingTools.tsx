'use client'

import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '@/store/store'
import { setSelectedTool, setSelectedColor, setStrokeWidth, setFill, undo, redo, setCanvasTexture, setGridSize } from '@/store/slices/drawing-slice'
import { Pencil, Square, Circle, Minus, Eraser, Palette, Undo2, Redo2, Grid3x3, CircleDot, X } from 'lucide-react'

export function DrawingTools() {
  const dispatch = useDispatch<AppDispatch>()
  const { selectedTool, selectedColor, strokeWidth, fill, historyIndex, history, canvasTexture, gridSize } = useSelector((state: RootState) => state.drawing)
  
  const tools = [
    { id: 'pen', icon: Pencil, label: 'Pen' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'line', icon: Minus, label: 'Line' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' }
  ]
  
  const presetColors = [
    { color: '#000000', name: 'Black' },
    { color: '#ef4444', name: 'Red' },
    { color: '#22c55e', name: 'Green' },
    { color: '#3b82f6', name: 'Blue' },
    { color: '#eab308', name: 'Yellow' },
    { color: '#a855f7', name: 'Purple' },
    { color: '#06b6d4', name: 'Cyan' }
  ]
  
  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Palette className="w-5 h-5 text-indigo-600" />
          Drawing Tools
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Undo/Redo Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">History</h3>
          <div className="flex gap-2">
            <button
              onClick={() => dispatch(undo())}
              disabled={historyIndex <= 0}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
                historyIndex > 0
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
              <span className="text-sm font-medium">Undo</span>
            </button>
            <button
              onClick={() => dispatch(redo())}
              disabled={historyIndex >= history.length - 1}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
                historyIndex < history.length - 1
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
              <span className="text-sm font-medium">Redo</span>
            </button>
          </div>
        </div>
        
        {/* Tools Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Tools</h3>
          <div className="grid grid-cols-3 gap-2">
            {tools.map((tool) => {
              const Icon = tool.icon
              return (
                <button
                  key={tool.id}
                  onClick={() => dispatch(setSelectedTool(tool.id as any))}
                  className={`relative p-3 rounded-xl transition-all duration-200 ${
                    selectedTool === tool.id
                      ? 'bg-indigo-100 text-indigo-600 shadow-md transform scale-105'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-sm'
                  }`}
                  title={tool.label}
                >
                  <Icon className="w-6 h-6 mx-auto" />
                  <span className="text-xs mt-1 block">{tool.label}</span>
                  {selectedTool === tool.id && (
                    <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full"></div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
        
        {/* Colors Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Colors</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-7 gap-2">
              {presetColors.map((preset) => (
                <button
                  key={preset.color}
                  onClick={() => dispatch(setSelectedColor(preset.color))}
                  className={`w-10 h-10 rounded-lg transition-all duration-200 ${
                    selectedColor === preset.color
                      ? 'ring-2 ring-offset-2 ring-indigo-500 transform scale-110'
                      : 'hover:scale-105 hover:shadow-md'
                  }`}
                  style={{ backgroundColor: preset.color }}
                  title={preset.name}
                />
              ))}
            </div>
            
            {/* Custom Color Picker */}
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600">Custom:</label>
              <div className="relative">
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => dispatch(setSelectedColor(e.target.value))}
                  className="w-24 h-10 rounded-lg cursor-pointer border-2 border-gray-200"
                />
              </div>
              <span className="text-sm font-mono text-gray-500">{selectedColor}</span>
            </div>
          </div>
        </div>
        
        {/* Stroke Width Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Stroke Width</h3>
          <div className="space-y-3">
            <input
              type="range"
              min="1"
              max="20"
              value={strokeWidth}
              onChange={(e) => dispatch(setStrokeWidth(Number(e.target.value)))}
              className="w-full accent-indigo-600"
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">1px</span>
              <span className="text-lg font-medium text-gray-900">{strokeWidth}px</span>
              <span className="text-sm text-gray-500">20px</span>
            </div>
            
            {/* Visual preview */}
            <div className="h-12 bg-gray-50 rounded-lg flex items-center justify-center">
              <div 
                className="rounded-full"
                style={{
                  width: `${strokeWidth}px`,
                  height: `${strokeWidth}px`,
                  backgroundColor: selectedColor
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Fill Option */}
        {(selectedTool === 'rectangle' || selectedTool === 'circle') && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Shape Options</h3>
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={fill}
                onChange={(e) => dispatch(setFill(e.target.checked))}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Fill shape with color</span>
            </label>
          </div>
        )}
        
        {/* Canvas Texture */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Canvas Texture</h3>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => dispatch(setCanvasTexture('none'))}
              className={`p-3 rounded-lg transition-all duration-200 flex flex-col items-center gap-1 ${
                canvasTexture === 'none'
                  ? 'bg-indigo-100 text-indigo-600 shadow-md'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
              title="No texture"
            >
              <X className="w-5 h-5" />
              <span className="text-xs">None</span>
            </button>
            <button
              onClick={() => dispatch(setCanvasTexture('grid'))}
              className={`p-3 rounded-lg transition-all duration-200 flex flex-col items-center gap-1 ${
                canvasTexture === 'grid'
                  ? 'bg-indigo-100 text-indigo-600 shadow-md'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
              title="Grid texture"
            >
              <Grid3x3 className="w-5 h-5" />
              <span className="text-xs">Grid</span>
            </button>
            <button
              onClick={() => dispatch(setCanvasTexture('dots'))}
              className={`p-3 rounded-lg transition-all duration-200 flex flex-col items-center gap-1 ${
                canvasTexture === 'dots'
                  ? 'bg-indigo-100 text-indigo-600 shadow-md'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
              title="Dot grid texture"
            >
              <CircleDot className="w-5 h-5" />
              <span className="text-xs">Dots</span>
            </button>
          </div>
        </div>
        
        {/* Grid Size Control - Only show when grid or dots texture is selected */}
        {(canvasTexture === 'grid' || canvasTexture === 'dots') && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Grid Size</h3>
            <div className="space-y-2">
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={gridSize}
                onChange={(e) => dispatch(setGridSize(Number(e.target.value)))}
                className="w-full"
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">10px</span>
                <span className="text-sm font-medium text-gray-700">{gridSize}px</span>
                <span className="text-xs text-gray-500">100px</span>
              </div>
              <div className="flex gap-1 mt-2">
                <button
                  onClick={() => dispatch(setGridSize(20))}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  20px
                </button>
                <button
                  onClick={() => dispatch(setGridSize(40))}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  40px
                </button>
                <button
                  onClick={() => dispatch(setGridSize(60))}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  60px
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}