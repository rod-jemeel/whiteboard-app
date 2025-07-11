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
      console.log('Attempting to join with code:', inviteCode)
      
      // Use the simple RPC function that bypasses RLS complexity
      const { data, error: joinError } = await supabase
        .rpc('join_whiteboard_by_code', { invite_code_input: inviteCode })

      console.log('Join result:', { data, error: joinError })

      if (joinError) {
        console.error('RPC error:', joinError)
        setError('Failed to join whiteboard. Please try again.')
        setIsLoading(false)
        return
      }

      if (!data || !data.success) {
        setError(data?.error || 'Invalid invite code')
        setIsLoading(false)
        return
      }

      // Success! Redirect to whiteboard
      console.log('Successfully joined, redirecting to:', data.whiteboard_id)
      router.push(`/whiteboard/${data.whiteboard_id}`)
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An error occurred. Please try again.')
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