'use client'

import { useAppSelector } from '@/store/hooks'
import Link from 'next/link'

export function WhiteboardGrid() {
  const { whiteboards, isLoading } = useAppSelector((state) => state.dashboard)
  
  if (isLoading) {
    return <div className="text-center py-8">Loading whiteboards...</div>
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {whiteboards.map((whiteboard) => (
        <Link
          key={whiteboard.id}
          href={`/whiteboard/${whiteboard.id}`}
          className="block p-4 border rounded-lg hover:shadow-md transition-shadow"
        >
          <h3 className="font-medium mb-2">{whiteboard.title}</h3>
          <p className="text-sm text-gray-500">
            Updated: {new Date(whiteboard.updatedAt).toLocaleDateString()}
          </p>
        </Link>
      ))}
    </div>
  )
}