'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestInvitePage() {
  const [inviteCode, setInviteCode] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const testInviteCode = async () => {
    setLoading(true)
    setResult(null)

    try {
      // Test 1: Check if user is authenticated
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        setResult({ error: 'Not authenticated', userError })
        setLoading(false)
        return
      }

      // Test 2: Query whiteboard by invite code
      const { data: whiteboard, error: whiteboardError } = await supabase
        .from('whiteboards')
        .select('*')
        .eq('invite_code', inviteCode.toUpperCase())
        .maybeSingle()

      // Test 3: Try alternative query without RLS
      const { data: allWhiteboards, error: allError } = await supabase
        .from('whiteboards')
        .select('id, name, invite_code')

      setResult({
        user: user.email,
        inviteCodeSearched: inviteCode.toUpperCase(),
        whiteboardFound: whiteboard,
        whiteboardError,
        totalWhiteboardsVisible: allWhiteboards?.length || 0,
        allWhiteboardsError: allError,
        sampleInviteCodes: allWhiteboards?.slice(0, 3).map(w => ({
          name: w.name,
          invite_code: w.invite_code
        }))
      })
    } catch (err) {
      setResult({ error: 'Unexpected error', details: err })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Test Invite Code System</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Enter invite code"
              className="flex-1 px-4 py-2 border rounded-lg text-gray-900"
            />
            <button
              onClick={testInviteCode}
              disabled={loading || !inviteCode}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Code'}
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Results:</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto text-gray-900">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-600">
          <p>This page tests:</p>
          <ul className="list-disc ml-6 mt-2">
            <li>Authentication status</li>
            <li>Ability to query whiteboards by invite code</li>
            <li>What whiteboards are visible to the current user</li>
            <li>Sample invite codes from visible whiteboards</li>
          </ul>
        </div>
      </div>
    </div>
  )
}