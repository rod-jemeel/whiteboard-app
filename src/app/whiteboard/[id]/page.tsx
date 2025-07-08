'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/store/store'
import { createClient } from '@/lib/supabase/client'
import dynamic from 'next/dynamic'
import { DrawingTools } from '@/components/whiteboard/DrawingTools'
import { ArrowLeft, Trash2, UserPlus, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import { setWhiteboard } from '@/store/slices/whiteboard-slice'
import { setUser } from '@/store/slices/auth-slice'
import { setZoom, resetZoom, addToHistory } from '@/store/slices/drawing-slice'
import { RealtimeCursor } from '@/components/realtime/RealtimeCursor'
import { CurrentUserAvatar } from '@/components/realtime/CurrentUserAvatar'
import { RealtimeAvatarStack } from '@/components/realtime/RealtimeAvatarStack'
import { RealtimeChat } from '@/components/realtime/RealtimeChat'
import { InviteModal } from '@/components/whiteboard/InviteModal'
import { ClearCanvasModal } from '@/components/whiteboard/ClearCanvasModal'

// Dynamically import Canvas component to avoid SSR issues with Konva
const Canvas = dynamic(() => import('@/components/whiteboard/Canvas').then((mod) => mod.Canvas), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
})

interface DrawingElement {
  id: string
  type: 'pen' | 'line' | 'rectangle' | 'circle' | 'eraser'
  points?: number[]
  x?: number
  y?: number
  width?: number
  height?: number
  radius?: number
  radiusX?: number
  radiusY?: number
  color: string
  strokeWidth: number
  fill?: string
}

export default function WhiteboardPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const user = useSelector((state: RootState) => state.auth.user)
  const whiteboard = useSelector((state: RootState) => state.whiteboard.currentWhiteboard)
  const zoom = useSelector((state: RootState) => state.drawing.zoom)
  const { history, historyIndex, canvasTexture } = useSelector((state: RootState) => state.drawing)
  const [drawings, setDrawings] = useState<DrawingElement[]>([])
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 })
  const [whiteboardId, setWhiteboardId] = useState<string | null>(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showClearModal, setShowClearModal] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function getParams() {
      const resolvedParams = await params
      setWhiteboardId(resolvedParams.id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    async function checkUserAndFetch() {
      try {
        // Get the current user from Supabase
        const { data: { user: currentUser }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error('Error getting user:', error)
          router.push('/auth')
          return
        }
        
        if (!currentUser) {
          router.push('/auth')
          return
        }
        
        // Update the user in Redux if needed
        if (!user || user.id !== currentUser.id) {
          dispatch(setUser(currentUser))
        }
      } catch (err) {
        console.error('Error in checkUserAndFetch:', err)
        router.push('/auth')
      }
    }
    
    checkUserAndFetch()
  }, [dispatch, router, user])

  // Handle undo/redo
  useEffect(() => {
    if (historyIndex >= 0 && history[historyIndex]) {
      setDrawings(history[historyIndex])
    }
  }, [historyIndex, history])
  
  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        dispatch({ type: 'drawing/undo' })
      } else if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        dispatch({ type: 'drawing/redo' })
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [dispatch])
  
  useEffect(() => {
    if (!user || !whiteboardId) return
    
    const updateSize = () => {
      setStageSize({
        width: window.innerWidth - 320,
        height: window.innerHeight - 120
      })
    }
    
    updateSize()
    window.addEventListener('resize', updateSize)
    
    fetchWhiteboard()
    fetchDrawings()
    
    // Subscribe to real-time drawing changes
    const channel = supabase
      .channel(`drawings:${whiteboardId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'drawings',
          filter: `whiteboard_id=eq.${whiteboardId}`
        },
        (payload) => {
          const newDrawing = {
            ...payload.new.data,
            id: payload.new.id
          }
          setDrawings(prev => [...prev, newDrawing])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'drawings',
          filter: `whiteboard_id=eq.${whiteboardId}`
        },
        () => {
          // Refetch all drawings when any are deleted
          fetchDrawings()
        }
      )
      .subscribe()
    
    return () => {
      window.removeEventListener('resize', updateSize)
      channel.unsubscribe()
    }
  }, [user, whiteboardId])

  const fetchWhiteboard = async () => {
    if (!whiteboardId) return
    try {
      const { data, error } = await supabase
        .from('whiteboards')
        .select('*')
        .eq('id', whiteboardId)
        .maybeSingle()

      if (error) {
        console.error('Error fetching whiteboard:', error)
        router.push('/dashboard')
        return
      }

      if (!data) {
        console.error('Whiteboard not found or access denied')
        router.push('/dashboard')
        return
      }

      dispatch(setWhiteboard(data))
    } catch (error) {
      console.error('Error fetching whiteboard:', error)
    }
  }

  const fetchDrawings = async () => {
    if (!whiteboardId) return
    try {
      const { data, error } = await supabase
        .from('drawings')
        .select('*')
        .eq('whiteboard_id', whiteboardId)
        .order('created_at', { ascending: true })

      if (error) throw error
      
      const formattedDrawings = data?.map(d => ({
        ...d.data,
        id: d.id,
        // Ensure type consistency - database stores 'pen' but UI might expect it
        type: d.data.type
      })) || []
      
      setDrawings(formattedDrawings)
      // Initialize history with current state
      dispatch(addToHistory(formattedDrawings))
    } catch (error) {
      console.error('Error fetching drawings:', error)
    }
  }

  const saveDrawing = async (drawing: DrawingElement) => {
    if (!whiteboardId || !user) return
    try {
      // Map our drawing types to database types
      const dbType = drawing.type === 'line' ? 'pen' : drawing.type
      
      const insertData = {
        whiteboard_id: whiteboardId,
        user_id: user.id,
        type: dbType,
        data: drawing
      }
      
      const { data, error } = await supabase
        .from('drawings')
        .insert(insertData)
        .select()

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }
    } catch (error) {
      console.error('Error saving drawing:', error)
    }
  }

  const handleDrawingComplete = async (newDrawing: DrawingElement) => {
    // Don't add to local state - let real-time subscription handle it
    await saveDrawing(newDrawing)
    // Add the current drawings state to history for undo/redo
    dispatch(addToHistory([...drawings, newDrawing]))
  }

  const clearMyDrawings = async () => {
    if (!whiteboardId || !user) return

    try {
      const { error } = await supabase
        .from('drawings')
        .delete()
        .eq('whiteboard_id', whiteboardId)
        .eq('user_id', user.id)

      if (error) throw error
      // The real-time subscription will handle updating the UI
    } catch (error) {
      console.error('Error clearing my drawings:', error)
    }
  }

  const clearAllDrawings = async () => {
    if (!whiteboardId || !user) return

    try {
      const { error } = await supabase
        .from('drawings')
        .delete()
        .eq('whiteboard_id', whiteboardId)

      if (error) throw error
      // The real-time subscription will handle updating the UI
    } catch (error) {
      console.error('Error clearing all drawings:', error)
    }
  }


  if (!whiteboardId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <DrawingTools />
      
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                {whiteboard?.name || 'Loading...'}
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <RealtimeAvatarStack whiteboardId={whiteboardId!} />
              <CurrentUserAvatar size="sm" />
              
              <div className="flex items-center gap-1 border-l pl-4">
                <button
                  onClick={() => dispatch(setZoom(Math.max(0.1, zoom - 0.1)))}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors group"
                  title="Zoom Out (Scroll Down)"
                >
                  <ZoomOut className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
                </button>
                <div className="px-3 py-1 bg-gray-100 rounded-lg">
                  <span className="text-sm font-semibold text-gray-900 min-w-[3.5rem] inline-block text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>
                <button
                  onClick={() => dispatch(setZoom(Math.min(5, zoom + 0.1)))}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors group"
                  title="Zoom In (Scroll Up)"
                >
                  <ZoomIn className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
                </button>
                <button
                  onClick={() => dispatch(resetZoom())}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Reset Zoom"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
              
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Invite
              </button>
              
              <button
                onClick={() => setShowClearModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear Canvas
              </button>
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-hidden bg-white relative">
          <Canvas 
            drawings={drawings}
            onDrawingComplete={handleDrawingComplete}
            stageSize={stageSize}
            zoom={zoom}
            onZoomChange={(newZoom) => dispatch(setZoom(newZoom))}
            canvasTexture={canvasTexture}
          />
          {whiteboardId && <RealtimeCursor whiteboardId={whiteboardId} />}
        </div>
      </div>
      
      {whiteboardId && <RealtimeChat whiteboardId={whiteboardId} />}
      
      {whiteboard && (
        <>
          <InviteModal
            whiteboardId={whiteboardId!}
            whiteboardName={whiteboard.name}
            inviteCode={whiteboard.invite_code || ''}
            isOpen={showInviteModal}
            onClose={() => setShowInviteModal(false)}
          />
          
          <ClearCanvasModal
            isOpen={showClearModal}
            onClose={() => setShowClearModal(false)}
            onClearMine={clearMyDrawings}
            onClearAll={clearAllDrawings}
            isOwner={whiteboard.user_id === user?.id}
          />
        </>
      )}
    </div>
  )
}