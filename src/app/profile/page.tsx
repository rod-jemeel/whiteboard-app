'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/store/store'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, User, Mail, Camera, Save, AlertCircle } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const user = useSelector((state: RootState) => state.auth.user)
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }
    fetchProfile()
  }, [user, router])

  const fetchProfile = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') { // Not found error
        throw error
      }

      if (data) {
        setUsername(data.username || '')
        setAvatarUrl(data.avatar_url || '')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async () => {
    if (!user) return
    
    setError('')
    setSaving(true)
    
    try {
      // Validate username
      if (username && username.length < 3) {
        setError('Username must be at least 3 characters long')
        return
      }

      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          username: username || null,
          avatar_url: avatarUrl || null
        })

      if (error) {
        if (error.code === '23505') {
          setError('This username is already taken')
        } else {
          throw error
        }
        return
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      setError('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return
    }

    const file = event.target.files[0]
    const fileExt = file.name.split('.').pop()
    const fileName = `${user?.id}-${Math.random()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    setLoading(true)
    try {
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setAvatarUrl(data.publicUrl)
    } catch (error) {
      console.error('Error uploading avatar:', error)
      setError('Failed to upload avatar')
    } finally {
      setLoading(false)
    }
  }

  const getInitials = () => {
    if (username) {
      return username.slice(0, 2).toUpperCase()
    }
    return user?.email?.slice(0, 2).toUpperCase() || '??'
  }

  const getAvatarColor = () => {
    return `hsl(${user?.id.charCodeAt(0) * 137.5 % 360}, 70%, 50%)`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                <div
                  className="w-32 h-32 rounded-full flex items-center justify-center text-3xl text-white font-bold"
                  style={{ backgroundColor: getAvatarColor() }}
                >
                  {getInitials()}
                </div>
              )}
              <label className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full cursor-pointer hover:bg-indigo-700 transition-colors">
                <Camera className="w-5 h-5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={uploadAvatar}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-gray-500">Click the camera icon to upload a new avatar</p>
          </div>

          {/* Form Section */}
          <div className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </div>
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Username
                </div>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a unique username"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be displayed to other users instead of your email
              </p>
            </div>

            <button
              onClick={updateProfile}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}