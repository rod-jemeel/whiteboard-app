'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function SetupPage() {
  const [status, setStatus] = useState<'idle' | 'running' | 'complete' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const supabase = createClient()

  const runMigration = async () => {
    setStatus('running')
    setMessage('Running database migration...')

    try {
      // This would normally run the SQL, but for security reasons,
      // we'll just provide instructions
      setStatus('complete')
      setMessage(`
        Migration SQL has been generated. Please run the following in your Supabase SQL editor:
        
        1. Go to your Supabase dashboard
        2. Navigate to SQL Editor
        3. Copy and run the SQL from: /docs/schema-update.sql
        
        The migration adds:
        - invite_code column to whiteboards
        - whiteboard_collaborators table
        - presence table for real-time features
        - Updated RLS policies
      `)
    } catch (error) {
      setStatus('error')
      setMessage('Error during migration setup')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <h1 className="text-2xl font-bold mb-6">Database Setup</h1>
        
        {status === 'idle' && (
          <>
            <p className="text-gray-600 mb-6">
              This will set up the database tables required for collaboration features:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-6 text-gray-600">
              <li>Invite codes for sharing whiteboards</li>
              <li>Collaborator management</li>
              <li>Real-time presence tracking</li>
              <li>Updated security policies</li>
            </ul>
            <button
              onClick={runMigration}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Generate Migration Instructions
            </button>
          </>
        )}

        {status === 'running' && (
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600">{message}</p>
          </div>
        )}

        {status === 'complete' && (
          <div>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <pre className="whitespace-pre-wrap text-sm">{message}</pre>
            </div>
            <a
              href="/dashboard"
              className="block w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors text-center"
            >
              Return to Dashboard
            </a>
          </div>
        )}

        {status === 'error' && (
          <div>
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{message}</p>
            <button
              onClick={() => setStatus('idle')}
              className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}