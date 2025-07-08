'use client'

import { AuthForm } from '@/components/auth/AuthForm'
import { ShaderGradientBackground } from '@/components/ui/ShaderGradientBackground'
import { useEffect, useState } from 'react'

export default function AuthPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {mounted && <ShaderGradientBackground />}
      
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Collaborative Whiteboard
          </h1>
          <p className="text-gray-200">Create and collaborate in real-time</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/20">
          <AuthForm />
        </div>
      </div>
    </div>
  )
}