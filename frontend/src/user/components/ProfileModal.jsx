import React from 'react'

export default function ProfileModal({ open, onClose, user }) {
  if (!open) return null
  const name = user?.name || 'User'
  const email = user?.email || 'user@example.com'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <div className="font-semibold">Profile</div>
          <button className="text-sm text-gray-500 hover:text-gray-700" onClick={onClose}>Close</button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <div className="text-sm text-gray-500">Name</div>
            <div className="text-base font-medium">{name}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Email</div>
            <div className="text-base font-medium">{email}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
