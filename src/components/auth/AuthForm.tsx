'use client'

import { useState } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useAppDispatch } from '@/store/hooks'
import { setUser } from '@/app/auth/_redux/auth-slice'

export function AuthForm() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const supabase = createClient()

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      dispatch(setUser(session.user))
      router.push('/dashboard')
    }
  })

  return (
    <div className="w-full max-w-md mx-auto">
      <Auth
        supabaseClient={supabase}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: '#6366f1',
                brandAccent: '#4f46e5',
                inputBackground: 'rgba(255, 255, 255, 0.1)',
                inputText: 'white',
                inputPlaceholder: 'rgba(255, 255, 255, 0.6)',
                inputBorder: 'rgba(255, 255, 255, 0.2)',
                inputBorderFocus: '#6366f1',
                inputBorderHover: 'rgba(255, 255, 255, 0.3)',
              },
            },
          },
          className: {
            container: 'w-full',
            button: 'w-full px-4 py-3 text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 transition-colors font-medium',
            input: 'w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent backdrop-blur-sm',
            label: 'text-white/90 font-medium text-sm mb-2 block',
            anchor: 'text-indigo-300 hover:text-indigo-200 transition-colors',
            divider: 'text-white/40',
            message: 'text-red-300 text-sm',
          },
        }}
        providers={[]}
        redirectTo={`${window.location.origin}/auth/callback`}
      />
    </div>
  )
}