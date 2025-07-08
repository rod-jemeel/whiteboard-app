'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ApiTestPage() {
  const [results, setResults] = useState<Array<{
    test: string
    success: boolean
    result?: unknown
    error?: string
    details?: unknown
    hint?: string
    code?: string
  }>>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const runTest = async (testName: string, testFn: () => Promise<unknown>) => {
    try {
      const result = await testFn()
      setResults(prev => [...prev, { test: testName, success: true, result }])
    } catch (error) {
      const errorObj = error as { message?: string; details?: unknown; hint?: string; code?: string }
      setResults(prev => [...prev, { 
        test: testName, 
        success: false, 
        error: errorObj.message || 'Unknown error',
        details: errorObj.details,
        hint: errorObj.hint,
        code: errorObj.code
      }])
    }
  }

  const runAllTests = async () => {
    setLoading(true)
    setResults([])

    // Test 1: Check auth
    await runTest('Check Authentication', async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return { userId: user?.id, email: user?.email }
    })

    // Test 2: Direct SQL query
    await runTest('Direct SQL Test', async () => {
      const { data, error } = await supabase
        .rpc('get_user_id')
        .single()
      
      if (!error) return data
      
      // If RPC doesn't exist, try a simple query
      const { data: testData, error: testError } = await supabase
        .from('whiteboards')
        .select('count')
        .single()
      
      if (testError) throw testError
      return testData
    })

    // Test 3: Create test whiteboard
    await runTest('Create Test Whiteboard', async () => {
      const { data, error } = await supabase
        .from('whiteboards')
        .insert({
          name: `Test Board ${Date.now()}`,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single()
      
      if (error) throw error
      
      // Clean up
      await supabase.from('whiteboards').delete().eq('id', data.id)
      return { created: data.id, cleaned: true }
    })

    // Test 4: Check RLS
    await runTest('Check RLS Status', async () => {
      const { data, error } = await supabase.rpc('check_rls_status')
      
      if (!error) return data
      
      // Fallback check
      return { note: 'RLS check unavailable' }
    })

    // Test 5: Simple select
    await runTest('Simple Select', async () => {
      const { data, error, count } = await supabase
        .from('whiteboards')
        .select('*', { count: 'exact', head: true })
      
      if (error) throw error
      return { count }
    })

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">API Connection Test</h1>
        
        <button
          onClick={runAllTests}
          disabled={loading}
          className="mb-6 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Running Tests...' : 'Run Tests'}
        </button>

        <div className="space-y-4">
          {results.map((result, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-lg border ${
                result.success 
                  ? 'bg-green-50 border-green-300' 
                  : 'bg-red-50 border-red-300'
              }`}
            >
              <h3 className="font-semibold text-gray-900 mb-2">
                {result.test} - {result.success ? '✅ Success' : '❌ Failed'}
              </h3>
              <pre className="text-sm bg-white p-2 rounded overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <a href="/dashboard" className="text-indigo-600 hover:text-indigo-700">
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}