'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { Send, MessageCircle, X } from 'lucide-react'

interface Message {
  id: string
  userId: string
  userEmail: string
  username?: string
  message: string
  timestamp: string
}

interface RealtimeChatProps {
  whiteboardId: string
}

export function RealtimeChat({ whiteboardId }: RealtimeChatProps) {
  const user = useSelector((state: RootState) => state.auth.user)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [userProfile, setUserProfile] = useState<{ username?: string } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  
  useEffect(() => {
    if (!user) return
    
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('user_id', user.id)
        .single()
      
      if (data) {
        setUserProfile(data)
      }
    }
    
    fetchProfile()
  }, [user, supabase])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
    if (isOpen) {
      setUnreadCount(0)
    }
  }, [messages, isOpen])

  useEffect(() => {
    if (!user || !whiteboardId) return

    const channel = supabase.channel(`chat:${whiteboardId}`)
      .on('broadcast', { event: 'message' }, ({ payload }) => {
        const newMsg: Message = {
          id: crypto.randomUUID(),
          userId: payload.userId,
          userEmail: payload.userEmail,
          username: payload.username,
          message: payload.message,
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, newMsg])
        
        if (!isOpen && payload.userId !== user.id) {
          setUnreadCount(prev => prev + 1)
        }
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user, whiteboardId, isOpen, supabase])

  const sendMessage = () => {
    if (!user || !newMessage.trim()) return

    supabase.channel(`chat:${whiteboardId}`)
      .send({
        type: 'broadcast',
        event: 'message',
        payload: {
          userId: user.id,
          userEmail: user.email || 'Anonymous',
          username: userProfile?.username,
          message: newMessage.trim()
        }
      })

    setNewMessage('')
  }

  const getInitials = (msg: Message) => {
    const name = msg.username || msg.userEmail.split('@')[0]
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

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors z-40"
      >
        <MessageCircle className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-80 h-96 bg-white rounded-lg shadow-2xl z-40 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-gray-900">Chat</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <p className="text-center text-gray-500 text-sm">No messages yet. Start a conversation!</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${
                    msg.userId === user?.id ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs text-white font-medium flex-shrink-0"
                    style={{ backgroundColor: getColor(msg.userId) }}
                  >
                    {getInitials(msg)}
                  </div>
                  <div
                    className={`max-w-[70%] ${
                      msg.userId === user?.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    } rounded-lg px-3 py-2`}
                  >
                    <p className="text-xs opacity-75 mb-1">
                      {msg.username || msg.userEmail.split('@')[0]}
                    </p>
                    <p className="text-sm">{msg.message}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-400"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}