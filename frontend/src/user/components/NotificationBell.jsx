import React, { useMemo, useState, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'

const severityDot = {
  info: 'bg-blue-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-600',
}

export default function NotificationBell({ notifications = [], unread = 0, onMarkRead, onMarkAllRead }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const recent = useMemo(() => notifications.slice(0, 10), [notifications])

  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        className="relative p-1 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="View notifications"
        onClick={() => setOpen(v => !v)}
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] leading-none px-1.5 py-0.5 rounded-full">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20">
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <div className="text-sm font-medium">Notifications</div>
            <button className="text-xs text-blue-600 hover:underline" onClick={onMarkAllRead}>Mark all read</button>
          </div>
          <div className="max-h-80 overflow-auto divide-y">
            {recent.length === 0 && (
              <div className="p-3 text-sm text-gray-500">No notifications</div>
            )}
            {recent.map(n => (
              <div key={n.id} className="p-3 hover:bg-gray-50 cursor-pointer" onClick={() => onMarkRead?.(n.id)}>
                <div className="flex items-start">
                  <span className={`mt-1 mr-2 h-2 w-2 rounded-full ${severityDot[n.severity] || severityDot.info}`}></span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold flex items-center">
                      <span>{n.title}</span>
                      {!n.read_at && <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px]">new</span>}
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">{n.message}</div>
                    <div className="text-[10px] text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
