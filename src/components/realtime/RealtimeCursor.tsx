'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'

interface CursorPosition {
  x: number
  y: number
  userId: string
  userEmail: string
  color: string
}

interface RealtimeCursorProps {
  whiteboardId: string
}

const userColors = [
  '#ef4444', '#f59e0b', '#10b981', '#3b82f6', 
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
]

export function RealtimeCursor({ whiteboardId }: RealtimeCursorProps) {
  const user = useSelector((state: RootState) => state.auth.user)
  const [cursors, setCursors] = useState<Map<string, CursorPosition>>(new Map())
  const [userColor] = useState(() => userColors[Math.floor(Math.random() * userColors.length)])
  const supabase = createClient()

  const broadcastCursor = useCallback((x: number, y: number) => {
    if (!user) return
    
    supabase.channel(`cursor:${whiteboardId}`)
      .send({
        type: 'broadcast',
        event: 'cursor',
        payload: {
          x,
          y,
          userId: user.id,
          userEmail: user.email || 'Anonymous',
          color: userColor
        }
      })
  }, [user, whiteboardId, userColor, supabase])

  useEffect(() => {
    if (!user || !whiteboardId) return

    const channel = supabase.channel(`cursor:${whiteboardId}`)
      .on('broadcast', { event: 'cursor' }, ({ payload }) => {
        if (payload.userId !== user.id) {
          setCursors(prev => {
            const newCursors = new Map(prev)
            newCursors.set(payload.userId, payload)
            return newCursors
          })
        }
      })
      .subscribe()

    // Remove cursor when user leaves
    const handleUserLeft = ({ payload }: any) => {
      setCursors(prev => {
        const newCursors = new Map(prev)
        newCursors.delete(payload.userId)
        return newCursors
      })
    }

    channel.on('broadcast', { event: 'user_left' }, handleUserLeft)

    // Broadcast when user leaves
    const cleanup = () => {
      channel.send({
        type: 'broadcast',
        event: 'user_left',
        payload: { userId: user.id }
      })
      channel.unsubscribe()
    }

    window.addEventListener('beforeunload', cleanup)

    return () => {
      cleanup()
      window.removeEventListener('beforeunload', cleanup)
    }
  }, [user, whiteboardId, supabase])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = document.querySelector('canvas')
      if (!canvas) return
      
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      broadcastCursor(x, y)
    }

    const canvas = document.querySelector('canvas')
    if (canvas) {
      canvas.addEventListener('mousemove', handleMouseMove)
      return () => canvas.removeEventListener('mousemove', handleMouseMove)
    }
  }, [broadcastCursor])

  return (
    <>
      {Array.from(cursors.values()).map((cursor) => (
        <div
          key={cursor.userId}
          className="absolute pointer-events-none z-50 transition-all duration-75"
          style={{
            left: cursor.x,
            top: cursor.y,
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z"
              fill={cursor.color}
              stroke="white"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
          <div
            className="absolute top-5 left-2 px-2 py-1 rounded text-xs text-white font-medium whitespace-nowrap"
            style={{ backgroundColor: cursor.color }}
          >
            {cursor.userEmail.split('@')[0]}
          </div>
        </div>
      ))}
    </>
  )
}