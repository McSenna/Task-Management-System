import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../../services/api'

export default function useNotifications(pollMs = 30000) {
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)
  const [toasts, setToasts] = useState([])
  const lastSeenIdsRef = useRef(new Set())
  const timerRef = useRef(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.getNotifications(20)
      if (res?.type === 'success') {
        const list = res.notifications || []
        setNotifications(list)
        setUnread(res.unread || 0)

        // Detect new items to toast (created within last minute and not seen)
        const now = Date.now()
        const newItems = []
        for (const n of list.slice(0, 5)) { // only recent few
          if (!lastSeenIdsRef.current.has(n.id)) {
            const createdAt = new Date(n.created_at).getTime()
            if (now - createdAt < 60 * 1000) {
              newItems.push(n)
            }
            lastSeenIdsRef.current.add(n.id)
          }
        }
        if (newItems.length) {
          setToasts(prev => [...newItems.map(n => ({ ...n, _ts: Date.now() })) , ...prev].slice(0, 5))
        }
      }
    } catch {
      void 0
    }
  }, [])

  const markRead = useCallback(async (id) => {
    try {
      await api.markNotificationRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      setUnread(prev => Math.max(0, prev - 1))
    } catch { void 0 }
  }, [])

  const markAllRead = useCallback(async () => {
    try {
      await api.markAllNotificationsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })))
      setUnread(0)
    } catch { void 0 }
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  useEffect(() => {
    fetchNotifications()
    if (pollMs > 0) {
      timerRef.current = setInterval(fetchNotifications, pollMs)
      return () => clearInterval(timerRef.current)
    }
  }, [fetchNotifications, pollMs])

  return useMemo(() => ({ notifications, unread, fetchNotifications, markRead, markAllRead, toasts, removeToast }), [notifications, unread, fetchNotifications, markRead, markAllRead, toasts, removeToast])
}
