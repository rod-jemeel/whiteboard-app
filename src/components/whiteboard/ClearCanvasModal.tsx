'use client'

import { AlertTriangle, Trash2, X } from 'lucide-react'

interface ClearCanvasModalProps {
  isOpen: boolean
  onClose: () => void
  onClearMine: () => void
  onClearAll: () => void
  isOwner: boolean
}

export function ClearCanvasModal({ isOpen, onClose, onClearMine, onClearAll, isOwner }: ClearCanvasModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl transform transition-all">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Clear Canvas</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <p className="text-sm text-amber-800">
              This action cannot be undone. Choose carefully.
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                onClearMine()
                onClose()
              }}
              className="w-full p-4 text-left hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Trash2 className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Clear My Drawings</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Remove only the drawings you created. Other users' drawings will remain.
                  </p>
                </div>
              </div>
            </button>
            
            {isOwner && (
              <button
                onClick={() => {
                  onClearAll()
                  onClose()
                }}
                className="w-full p-4 text-left hover:bg-red-50 rounded-lg transition-colors border border-red-200"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Clear All Drawings</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Remove all drawings from the canvas. This affects all users.
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      Only available to whiteboard owner
                    </p>
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}