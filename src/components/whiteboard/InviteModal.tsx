'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Copy, X, UserPlus, Check } from 'lucide-react'

interface InviteModalProps {
  whiteboardId: string
  whiteboardName: string
  inviteCode: string
  isOpen: boolean
  onClose: () => void
}

export function InviteModal({ whiteboardId, whiteboardName, inviteCode, isOpen, onClose }: InviteModalProps) {
  const [copied, setCopied] = useState(false)
  const supabase = createClient()

  if (!isOpen) return null

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyInviteLink = () => {
    const link = `${window.location.origin}/join/${inviteCode}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <UserPlus className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Invite Collaborators</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Share this code to invite others to</p>
            <p className="font-semibold text-gray-900">{whiteboardName}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Invite Code</p>
                <p className="text-2xl font-mono font-bold text-gray-900">{inviteCode}</p>
              </div>
              <button
                onClick={copyInviteCode}
                className="p-2 hover:bg-white rounded-lg transition-all"
                title="Copy code"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={copyInviteLink}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              <Copy className="w-4 h-4" />
              Copy Invite Link
            </button>
          </div>

          <div className="text-xs text-gray-500 text-center pt-2">
            Anyone with this code can join and collaborate on this whiteboard
          </div>
        </div>
      </div>
    </div>
  )
}