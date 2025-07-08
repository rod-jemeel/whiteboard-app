'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestInviteDetailedPage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const runTests = async () => {
    setLoading(true)
    setResults([])
    const testResults: any[] = []

    try {
      // Test 1: Check authentication
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      testResults.push({
        test: 'Authentication Check',
        success: !!user,
        user: user?.email,
        error: userError
      })

      if (!user) {
        setResults(testResults)
        setLoading(false)
        return
      }

      // Test 2: Get all visible whiteboards
      const { data: allWhiteboards, error: allError } = await supabase
        .from('whiteboards')
        .select('id, name, invite_code, user_id')
      
      testResults.push({
        test: 'Get All Whiteboards',
        success: !allError,
        count: allWhiteboards?.length || 0,
        sample: allWhiteboards?.slice(0, 3),
        error: allError
      })

      // Test 3: Test specific invite code
      const testCode = 'A581823E'
      const { data: specificWhiteboard, error: specificError } = await supabase
        .from('whiteboards')
        .select('*')
        .eq('invite_code', testCode)
        .maybeSingle()
      
      testResults.push({
        test: `Query Specific Code: ${testCode}`,
        success: !specificError,
        found: !!specificWhiteboard,
        data: specificWhiteboard,
        error: specificError
      })

      // Test 4: Test with ILIKE for partial match
      const { data: partialMatch, error: partialError } = await supabase
        .from('whiteboards')
        .select('id, name, invite_code')
        .ilike('invite_code', `%${testCode}%`)
      
      testResults.push({
        test: `Partial Match for: ${testCode}`,
        success: !partialError,
        count: partialMatch?.length || 0,
        data: partialMatch,
        error: partialError
      })

      // Test 5: Get owned whiteboards
      const { data: ownedWhiteboards, error: ownedError } = await supabase
        .from('whiteboards')
        .select('id, name, invite_code')
        .eq('user_id', user.id)
      
      testResults.push({
        test: 'Get Owned Whiteboards',
        success: !ownedError,
        count: ownedWhiteboards?.length || 0,
        data: ownedWhiteboards,
        error: ownedError
      })

      // Test 6: Raw SQL query
      const { data: rawQuery, error: rawError } = await supabase
        .rpc('get_whiteboard_by_invite_code', { code: testCode })
      
      testResults.push({
        test: 'Raw SQL Function (if exists)',
        success: !rawError,
        data: rawQuery,
        error: rawError
      })

    } catch (err) {
      testResults.push({
        test: 'Unexpected Error',
        success: false,
        error: err
      })
    }

    setResults(testResults)
    setLoading(false)
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Detailed Invite Code Testing</h1>
        
        <button
          onClick={runTests}
          disabled={loading}
          className="mb-6 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Running Tests...' : 'Run All Tests'}
        </button>

        <div className="space-y-4">
          {results.map((result, index) => (
            <div 
              key={index} 
              className={`bg-white p-6 rounded-lg shadow ${
                result.success ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
              }`}
            >
              <h3 className="text-lg font-semibold mb-2">
                {result.test} {result.success ? '✅' : '❌'}
              </h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto text-gray-900">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">What This Tests:</h2>
          <ul className="space-y-2 text-gray-700">
            <li>1. ✓ Authentication status</li>
            <li>2. ✓ All whiteboards visible to you</li>
            <li>3. ✓ Direct query for invite code 'A581823E'</li>
            <li>4. ✓ Partial match search</li>
            <li>5. ✓ Your owned whiteboards</li>
            <li>6. ✓ Raw SQL function (if created)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}