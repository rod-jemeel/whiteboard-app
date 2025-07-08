'use client'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { createClient } from '@/lib/supabase/client'

interface CurrentUserAvatarProps {
  size?: 'sm' | 'md' | 'lg'
  showEmail?: boolean
  showUsername?: boolean
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base'
}

export function CurrentUserAvatar({ size = 'md', showEmail = false, showUsername = false }: CurrentUserAvatarProps) {
  const user = useSelector((state: RootState) => state.auth.user)
  const [profile, setProfile] = useState<{ username?: string; avatar_url?: string } | null>(null)
  const supabase = createClient()
  
  useEffect(() => {
    if (!user) return
    
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('user_profiles')
        .select('username, avatar_url')
        .eq('user_id', user.id)
        .single()
      
      if (data) {
        setProfile(data)
      }
    }
    
    fetchProfile()
  }, [user, supabase])
  
  if (!user) return null
  
  const displayName = profile?.username || user.email?.split('@')[0] || 'User'
  const initials = displayName
    .split(/[\s\.]/)
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??'
  
  const backgroundColor = `hsl(${user.id.charCodeAt(0) * 137.5 % 360}, 70%, 50%)`
  
  return (
    <div className="flex items-center gap-2">
      {profile?.avatar_url ? (
        <img
          src={profile.avatar_url}
          alt={displayName}
          className={`${sizeClasses[size]} rounded-full object-cover shadow-md`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-medium shadow-md`}
          style={{ backgroundColor }}
        >
          {initials}
        </div>
      )}
      {(showEmail || showUsername) && (
        <span className="text-sm text-gray-600">
          {showUsername && profile?.username ? profile.username : user.email}
        </span>
      )}
    </div>
  )
}