'use client'

export function SocialLoginButtons() {
  return (
    <div className="space-y-3">
      <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
        <span>Continue with Google</span>
      </button>
      <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
        <span>Continue with GitHub</span>
      </button>
    </div>
  )
}