'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'

interface OnlineUser {
  id: string
  email: string
  username?: string
  avatarUrl?: string
  lastSeen: string
}

interface RealtimeAvatarStackProps {
  whiteboardId: string
}

export function RealtimeAvatarStack({ whiteboardId }: RealtimeAvatarStackProps) {
  const user = useSelector((state: RootState) => state.auth.user)
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const supabase = createClient()

  useEffect(() => {
    if (!user || !whiteboardId) return

    const updatePresence = async () => {
      try {
        // First fetch user profile
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('username, avatar_url')
          .eq('user_id', user.id)
          .single()
        
        const { error } = await supabase
          .from('presence')
          .upsert({
            whiteboard_id: whiteboardId,
            user_id: user.id,
            user_email: user.email,
            user_name: profileData?.username || user.email?.split('@')[0],
            is_online: true,
            last_seen: new Date().toISOString()
          }, {
            onConflict: 'whiteboard_id,user_id'
          })
          .select()
        
        if (error) {
          console.error('Presence update error:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
            fullError: error
          })
          // Don't throw - just log the error
        }
      } catch (err) {
        console.error('Failed to update presence:', err)
      }
    }

    // Update presence immediately
    updatePresence()

    // Set up interval to update presence
    const interval = setInterval(updatePresence, 30000) // Every 30 seconds

    // Subscribe to presence changes
    const channel = supabase
      .channel(`presence:${whiteboardId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'presence',
          filter: `whiteboard_id=eq.${whiteboardId}`
        },
        async () => {
          try {
            // Fetch all online users
            const { data, error } = await supabase
              .from('presence')
              .select('*')
              .eq('whiteboard_id', whiteboardId)
              .eq('is_online', true)
              .gte('last_seen', new Date(Date.now() - 60000).toISOString()) // Active in last minute

            if (error) {
              console.error('Presence fetch error:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
              })
              return
            }

            if (data) {
              // Fetch profiles for all online users
              const userIds = data.map(u => u.user_id)
              const { data: profiles } = await supabase
                .from('user_profiles')
                .select('user_id, username, avatar_url')
                .in('user_id', userIds)
              
              const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || [])
              
              setOnlineUsers(
                data
                  .filter(u => u.user_id !== user.id)
                  .map(u => {
                    const profile = profileMap.get(u.user_id)
                    return {
                      id: u.user_id,
                      email: u.user_email || 'Anonymous',
                      username: profile?.username || u.user_name,
                      avatarUrl: profile?.avatar_url,
                      lastSeen: u.last_seen
                    }
                  })
              )
            }
          } catch (err) {
            console.error('Failed to fetch presence:', err)
          }
        }
      )
      .subscribe()

    // Set offline on cleanup
    const setOffline = async () => {
      try {
        await supabase
          .from('presence')
          .update({ is_online: false })
          .eq('whiteboard_id', whiteboardId)
          .eq('user_id', user.id)
      } catch (err) {
        // Silently fail on cleanup
      }
    }

    window.addEventListener('beforeunload', setOffline)

    return () => {
      clearInterval(interval)
      setOffline()
      channel.unsubscribe()
      window.removeEventListener('beforeunload', setOffline)
    }
  }, [user, whiteboardId, supabase])

  const getInitials = (user: OnlineUser) => {
    const name = user.username || user.email.split('@')[0]
    return name
      .split(/[\s\.]/)
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getColor = (id: string) => {
    return `hsl(${id.charCodeAt(0) * 137.5 % 360}, 70%, 50%)`
  }

  if (onlineUsers.length === 0) return null

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {onlineUsers.slice(0, 3).map((onlineUser) => (
          onlineUser.avatarUrl ? (
            <img
              key={onlineUser.id}
              src={onlineUser.avatarUrl}
              alt={onlineUser.username || onlineUser.email}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-white"
              title={onlineUser.username || onlineUser.email}
            />
          ) : (
            <div
              key={onlineUser.id}
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs text-white font-medium ring-2 ring-white"
              style={{ backgroundColor: getColor(onlineUser.id) }}
              title={onlineUser.username || onlineUser.email}
            >
              {getInitials(onlineUser)}
            </div>
          )
        ))}
        {onlineUsers.length > 3 && (
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium ring-2 ring-white">
            +{onlineUsers.length - 3}
          </div>
        )}
      </div>
      <span className="text-sm text-gray-600">
        {onlineUsers.length} {onlineUsers.length === 1 ? 'collaborator' : 'collaborators'} online
      </span>
    </div>
  )
}