import React, { useEffect } from 'react'

const severityStyles = {
  info: 'border-blue-200 bg-blue-50 text-blue-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  danger: 'border-red-200 bg-red-50 text-red-800',
}

export default function ToastNotifications({ toasts, onClose }) {
  useEffect(() => {
    const timers = toasts.map(t => setTimeout(() => onClose?.(t.id), 6000))
    return () => timers.forEach(clearTimeout)
  }, [toasts, onClose])

  return (
    <div className="fixed bottom-4 right-4 z-40 space-y-2 w-80 max-w-[90vw]">
      {toasts.map(t => (
        <div key={t.id} className={`border rounded-lg shadow-sm p-3 ${severityStyles[t.severity] || severityStyles.info}`}>
          <div className="text-sm font-semibold">{t.title}</div>
          <div className="text-xs mt-1">{t.message}</div>
          <div className="flex justify-end mt-2">
            <button className="text-xs underline" onClick={() => onClose?.(t.id)}>Dismiss</button>
          </div>
        </div>
      ))}
    </div>
  )
}
