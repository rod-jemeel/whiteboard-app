import { Trash2, Calendar, Pencil, Users } from 'lucide-react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'

interface Whiteboard {
  id: string
  name: string
  user_id: string
  created_at: string
  updated_at: string
}

interface WhiteboardGridProps {
  whiteboards: Whiteboard[]
  onDelete: (id: string) => void
  onOpen: (id: string) => void
}

export function WhiteboardGrid({ whiteboards, onDelete, onOpen }: WhiteboardGridProps) {
  const user = useSelector((state: RootState) => state.auth.user)
  
  if (whiteboards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="p-6 bg-gray-100 rounded-full mb-4">
          <Pencil className="w-12 h-12 text-gray-400" />
        </div>
        <p className="text-gray-500 text-lg font-medium">No whiteboards yet</p>
        <p className="text-gray-400 mt-2">Create your first whiteboard to get started!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {whiteboards.map((whiteboard) => (
        <div
          key={whiteboard.id}
          className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1"
          onClick={() => onOpen(whiteboard.id)}
        >
          <div className="aspect-[4/3] bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center relative overflow-hidden">
            <div 
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: 'linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}
            ></div>
            <Pencil className="w-16 h-16 text-indigo-200 group-hover:scale-110 transition-transform duration-300" />
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/10 transition-colors duration-300 flex items-center justify-center">
              <span className="text-white bg-indigo-600 px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 font-medium">
                Open Whiteboard
              </span>
            </div>
          </div>
          
          <div className="p-5">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 text-lg truncate flex-1">
                {whiteboard.name}
              </h3>
              {whiteboard.user_id !== user?.id && (
                <span className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                  <Users className="w-3 h-3" />
                  Shared
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Updated {new Date(whiteboard.updated_at).toLocaleDateString()}</span>
            </div>
            
            {whiteboard.user_id === user?.id && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(whiteboard.id)
                }}
                className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-50 hover:text-red-600"
                title="Delete whiteboard"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}