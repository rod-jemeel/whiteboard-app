'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { Loader2 } from 'lucide-react'
import { handleSupabaseError } from '@/lib/supabase/error-handler'

export default function JoinWhiteboardPage({ params }: { params: Promise<{ code: string }> }) {
  const router = useRouter()
  const user = useSelector((state: RootState) => state.auth.user)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function getParams() {
      const resolvedParams = await params
      setInviteCode(resolvedParams.code.toUpperCase())
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (!user) {
      router.push(`/auth?redirect=/join/${inviteCode}`)
      return
    }

    if (!inviteCode) return

    joinWhiteboard()
  }, [user, inviteCode, router])

  const joinWhiteboard = async () => {
    try {
      // First ensure user is authenticated
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        router.push('/auth')
        return
      }

      // Debug: Log the invite code we're searching for
      console.log('Searching for whiteboard with invite code:', inviteCode)

      // Find whiteboard by invite code
      const { data: whiteboard, error: whiteboardError } = await supabase
        .from('whiteboards')
        .select('*')
        .eq('invite_code', inviteCode)
        .maybeSingle() // Use maybeSingle to handle no results gracefully
      
      console.log('Whiteboard query result:', { whiteboard, error: whiteboardError })

      if (whiteboardError) {
        const errorMessage = handleSupabaseError(whiteboardError, 'Join Whiteboard')
        setError(errorMessage)
        setIsLoading(false)
        return
      }

      if (!whiteboard) {
        console.error('No whiteboard found for invite code:', inviteCode)
        setError('Invalid invite code. Please check the code and try again.')
        setIsLoading(false)
        return
      }

      // Check if user is already the owner
      if (whiteboard.user_id === user?.id) {
        router.push(`/whiteboard/${whiteboard.id}`)
        return
      }

      // Check if user is already a collaborator
      const { data: existingCollab } = await supabase
        .from('whiteboard_collaborators')
        .select('*')
        .eq('whiteboard_id', whiteboard.id)
        .eq('user_id', user?.id)
        .maybeSingle()

      if (existingCollab) {
        // Already a collaborator, just redirect
        router.push(`/whiteboard/${whiteboard.id}`)
        return
      }

      // Add user as collaborator
      const { error: collabError } = await supabase
        .from('whiteboard_collaborators')
        .insert({
          whiteboard_id: whiteboard.id,
          user_id: user?.id,
          role: 'editor'
        })

      if (collabError) {
        console.error('Failed to add collaborator:', collabError)
        setError(`Failed to join whiteboard: ${collabError.message}`)
        setIsLoading(false)
        return
      }

      // Redirect to whiteboard
      router.push(`/whiteboard/${whiteboard.id}`)
    } catch (err) {
      console.error('Unexpected error in joinWhiteboard:', err)
      setError('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Joining whiteboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 text-red-700 px-6 py-4 rounded-lg mb-4">
            {error}
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return null
}