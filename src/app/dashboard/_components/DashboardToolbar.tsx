'use client'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setFilter, setSortBy, setSearchQuery } from '@/app/dashboard/_redux/dashboard-slice'

export function DashboardToolbar() {
  const dispatch = useAppDispatch()
  const { filter, sortBy, searchQuery } = useAppSelector((state) => state.dashboard)
  
  return (
    <div className="flex items-center gap-4 mb-6">
      <input
        type="text"
        placeholder="Search whiteboards..."
        value={searchQuery}
        onChange={(e) => dispatch(setSearchQuery(e.target.value))}
        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      
      <select
        value={filter}
        onChange={(e) => dispatch(setFilter(e.target.value as any))}
        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">All</option>
        <option value="recent">Recent</option>
        <option value="shared">Shared</option>
      </select>
      
      <select
        value={sortBy}
        onChange={(e) => dispatch(setSortBy(e.target.value as any))}
        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="date">Date</option>
        <option value="name">Name</option>
      </select>
    </div>
  )
}