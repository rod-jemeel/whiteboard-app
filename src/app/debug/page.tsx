'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'

export default function DebugPage() {
  const user = useSelector((state: RootState) => state.auth.user)
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!user) return
    runTests()
  }, [user])

  const runTests = async () => {
    setLoading(true)
    const testResults: any = {}

    // Test 1: Check user
    testResults.user = {
      id: user?.id,
      email: user?.email
    }

    // Test 2: Check whiteboards table
    try {
      const { data, error } = await supabase
        .from('whiteboards')
        .select('*')
        .eq('user_id', user?.id)
        .limit(1)
      
      testResults.whiteboards = {
        success: !error,
        error: error?.message,
        hasData: data && data.length > 0
      }
    } catch (e: any) {
      testResults.whiteboards = { error: e.message }
    }

    // Test 3: Check whiteboard_collaborators table
    try {
      const { data, error } = await supabase
        .from('whiteboard_collaborators')
        .select('*')
        .limit(1)
      
      testResults.collaborators = {
        success: !error,
        error: error?.message,
        tableExists: !error || !error.message.includes('relation')
      }
    } catch (e: any) {
      testResults.collaborators = { error: e.message }
    }

    // Test 4: Check invite_code column
    try {
      const { data, error } = await supabase
        .from('whiteboards')
        .select('id, invite_code')
        .limit(1)
      
      testResults.inviteCode = {
        success: !error,
        error: error?.message,
        columnExists: !error || !error.message.includes('column')
      }
    } catch (e: any) {
      testResults.inviteCode = { error: e.message }
    }

    // Test 5: Check presence table
    try {
      const { data, error } = await supabase
        .from('presence')
        .select('*')
        .limit(1)
      
      testResults.presence = {
        success: !error,
        error: error?.message,
        tableExists: !error || !error.message.includes('relation')
      }
    } catch (e: any) {
      testResults.presence = { error: e.message }
    }

    // Test 6: Check RLS policies
    try {
      // Try to insert a test collaborator (will fail if no whiteboard exists)
      const { error } = await supabase
        .from('whiteboard_collaborators')
        .select('*')
        .eq('user_id', user?.id)
      
      testResults.rlsPolicies = {
        canQuery: !error,
        error: error?.message
      }
    } catch (e: any) {
      testResults.rlsPolicies = { error: e.message }
    }

    setResults(testResults)
    setLoading(false)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-700">Please log in to run debug tests</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Database Debug Information</h1>
        
        {loading ? (
          <p className="text-gray-700">Running tests...</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(results).map(([key, value]) => (
              <div key={key} className="bg-white rounded-lg p-4 shadow border border-gray-200">
                <h2 className="font-semibold text-lg mb-2 capitalize text-gray-900">{key}</h2>
                <pre className="text-sm bg-gray-900 text-gray-100 p-3 rounded overflow-auto">
                  {JSON.stringify(value, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-8">
          <a 
            href="/dashboard" 
            className="text-indigo-600 hover:text-indigo-700"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}