'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { Loader2 } from 'lucide-react'

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
      // Find whiteboard by invite code
      const { data: whiteboard, error: whiteboardError } = await supabase
        .from('whiteboards')
        .select('*')
        .eq('invite_code', inviteCode)
        .single()

      if (whiteboardError || !whiteboard) {
        setError('Invalid invite code')
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
        .single()

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
        setError('Failed to join whiteboard')
        setIsLoading(false)
        return
      }

      // Redirect to whiteboard
      router.push(`/whiteboard/${whiteboard.id}`)
    } catch (err) {
      setError('An error occurred')
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