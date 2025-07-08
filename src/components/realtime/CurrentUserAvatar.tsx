'use client'

import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'

interface CurrentUserAvatarProps {
  size?: 'sm' | 'md' | 'lg'
  showEmail?: boolean
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base'
}

export function CurrentUserAvatar({ size = 'md', showEmail = false }: CurrentUserAvatarProps) {
  const user = useSelector((state: RootState) => state.auth.user)
  
  if (!user) return null
  
  const initials = user.email
    ?.split('@')[0]
    .split('.')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??'
  
  const backgroundColor = `hsl(${user.id.charCodeAt(0) * 137.5 % 360}, 70%, 50%)`
  
  return (
    <div className="flex items-center gap-2">
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-medium shadow-md`}
        style={{ backgroundColor }}
      >
        {initials}
      </div>
      {showEmail && (
        <span className="text-sm text-gray-600">{user.email}</span>
      )}
    </div>
  )
}