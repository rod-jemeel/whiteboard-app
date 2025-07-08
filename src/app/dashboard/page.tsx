'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/store/store'
import { createClient } from '@/lib/supabase/client'
import { Plus, LogOut, LayoutGrid, UserPlus } from 'lucide-react'
import { WhiteboardGrid } from '@/components/dashboard/WhiteboardGrid'
import { setWhiteboards, setLoading } from '@/store/slices/dashboard-slice'
import { logout } from '@/store/slices/auth-slice'
import { checkMigrationStatus } from '@/lib/supabase/migration-check'

export default function DashboardPage() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const user = useSelector((state: RootState) => state.auth.user)
  const { whiteboards, isLoading } = useSelector((state: RootState) => state.dashboard)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newWhiteboardName, setNewWhiteboardName] = useState('')
  const [isMigrated, setIsMigrated] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }
    fetchWhiteboards()
  }, [user, router])

  const fetchWhiteboards = async () => {
    dispatch(setLoading(true))
    try {
      const migrationStatus = await checkMigrationStatus()
      setIsMigrated(migrationStatus.isFullyMigrated)
      
      // Fetch owned whiteboards
      const { data: ownedWhiteboards, error: ownedError } = await supabase
        .from('whiteboards')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (ownedError) {
        console.error('Owned whiteboards query error:', ownedError)
        console.error('Error details:', {
          message: ownedError.message,
          details: ownedError.details,
          hint: ownedError.hint,
          code: ownedError.code
        })
        // Don't throw - try to continue with empty array
        dispatch(setWhiteboards([]))
        dispatch(setLoading(false))
        return
      }

      let allWhiteboards = ownedWhiteboards || []

      // Only fetch shared whiteboards if migration is complete
      if (migrationStatus.hasCollaboratorsTable) {
        try {
          const { data: sharedCollabs, error: sharedError } = await supabase
            .from('whiteboard_collaborators')
            .select('whiteboard_id')
            .eq('user_id', user?.id)

          if (!sharedError && sharedCollabs && sharedCollabs.length > 0) {
            const sharedIds = sharedCollabs.map(c => c.whiteboard_id)
            const { data: shared } = await supabase
              .from('whiteboards')
              .select('*')
              .in('id', sharedIds)
              .order('created_at', { ascending: false })

            if (shared) {
              allWhiteboards = [...allWhiteboards, ...shared]
            }
          }
        } catch (err) {
          console.log('Collaboration features not yet available')
        }
      }

      dispatch(setWhiteboards(allWhiteboards))
    } catch (error: any) {
      console.error('Error fetching whiteboards:', error)
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      // Still show owned whiteboards even if collaboration features fail
      dispatch(setWhiteboards([]))
    } finally {
      dispatch(setLoading(false))
    }
  }

  const createWhiteboard = async () => {
    if (!newWhiteboardName.trim()) return

    try {
      const { data, error } = await supabase
        .from('whiteboards')
        .insert({
          name: newWhiteboardName,
          user_id: user?.id
        })
        .select()
        .single()

      if (error) {
        console.error('Create whiteboard error:', error)
        alert(`Failed to create whiteboard: ${error.message || 'Unknown error'}`)
        throw error
      }

      setShowCreateDialog(false)
      setNewWhiteboardName('')
      fetchWhiteboards()
    } catch (error) {
      console.error('Error creating whiteboard:', error)
    }
  }

  const deleteWhiteboard = async (id: string) => {
    if (!confirm('Are you sure you want to delete this whiteboard?')) return

    try {
      const { error } = await supabase
        .from('whiteboards')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchWhiteboards()
    } catch (error) {
      console.error('Error deleting whiteboard:', error)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    dispatch(logout())
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <LayoutGrid className="w-5 h-5 text-indigo-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">My Whiteboards</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 font-medium">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <p className="text-gray-600">
            Create and manage your collaborative whiteboards
          </p>
          <div className="flex gap-3">
            {isMigrated && (
              <button
                onClick={() => router.push('/join')}
                className="flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-xl hover:bg-indigo-50 transition-all border border-indigo-200"
              >
                <UserPlus className="w-5 h-5" />
                <span className="font-medium">Join Whiteboard</span>
              </button>
            )}
            <button
              onClick={() => setShowCreateDialog(true)}
              className="group flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-medium">Create New</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-indigo-600 absolute inset-0"></div>
            </div>
            <p className="mt-4 text-gray-500">Loading your whiteboards...</p>
          </div>
        ) : (
          <WhiteboardGrid 
            whiteboards={whiteboards} 
            onDelete={deleteWhiteboard}
            onOpen={(id) => router.push(`/whiteboard/${id}`)}
          />
        )}
      </main>

      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl transform transition-all">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Create New Whiteboard</h2>
            <input
              type="text"
              value={newWhiteboardName}
              onChange={(e) => setNewWhiteboardName(e.target.value)}
              placeholder="Enter whiteboard name"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              onKeyDown={(e) => e.key === 'Enter' && createWhiteboard()}
              autoFocus
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={createWhiteboard}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-all font-medium shadow-lg hover:shadow-xl"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowCreateDialog(false)
                  setNewWhiteboardName('')
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-all font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}