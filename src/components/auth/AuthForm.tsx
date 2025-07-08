'use client'

import { useState } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/store/store'
import { setUser } from '@/store/slices/auth-slice'
import { getFullUrl } from '@/lib/utils/app-url'

export function AuthForm() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
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
                inputBackground: 'rgba(255, 255, 255, 0.9)',
                inputText: '#1f2937',
                inputPlaceholder: '#6b7280',
                inputBorder: 'rgba(255, 255, 255, 0.3)',
                inputBorderFocus: '#6366f1',
                inputBorderHover: 'rgba(255, 255, 255, 0.5)',
                inputLabelText: '#ffffff',
                anchorTextColor: '#e0e7ff',
                anchorTextHoverColor: '#c7d2fe',
              },
            },
          },
          className: {
            container: 'w-full [&_label]:!text-white [&_label]:!opacity-90',
            button: 'w-full px-4 py-3 text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 transition-colors font-medium',
            input: 'w-full px-4 py-3 bg-white/90 border border-white/30 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent backdrop-blur-sm',
            label: '!text-white !opacity-90 font-medium text-sm mb-2 block',
            anchor: 'text-indigo-300 hover:text-indigo-200 transition-colors',
            divider: 'text-white/40',
            message: 'text-red-300 text-sm',
          },
        }}
        providers={[]}
        redirectTo={getFullUrl('/auth/callback')}
      />
    </div>
  )
}