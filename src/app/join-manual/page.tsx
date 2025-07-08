'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'

export default function ManualJoinPage() {
  const router = useRouter()
  const user = useSelector((state: RootState) => state.auth.user)
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const supabase = createClient()

  const handleJoin = async () => {
    if (!inviteCode.trim()) {
      setError('Please enter an invite code')
      return
    }

    if (!user) {
      router.push('/auth')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Use the RPC function
      const { data, error: joinError } = await supabase
        .rpc('join_whiteboard_by_code', { 
          invite_code_input: inviteCode.trim().toUpperCase() 
        })

      if (joinError) {
        setError('Failed to join whiteboard')
        setLoading(false)
        return
      }

      if (!data || !data.success) {
        setError(data?.error || 'Invalid invite code')
        setLoading(false)
        return
      }

      setSuccess('Successfully joined! Redirecting...')
      setTimeout(() => {
        router.push(`/whiteboard/${data.whiteboard_id}`)
      }, 1000)
    } catch (err) {
      setError('An error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Join Whiteboard</h1>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invite Code
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="Enter invite code"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            <button
              onClick={handleJoin}
              disabled={loading || !inviteCode.trim()}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Joining...' : 'Join Whiteboard'}
            </button>

            <div className="text-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Don't have an invite code?</p>
          <p>Ask the whiteboard owner to share their invite code with you.</p>
        </div>
      </div>
    </div>
  )
}