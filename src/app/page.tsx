'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'

export default function Home() {
  const router = useRouter()
  const user = useSelector((state: RootState) => state.auth.user)

  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    } else {
      router.push('/auth')
    }
  }, [user, router])

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  )
}