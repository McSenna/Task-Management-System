import axios from 'axios'

const base = import.meta.env.VITE_REACT_APP_API_URL

const instance = axios.create({
  baseURL: base,
  withCredentials: true,
})

export const api = {
  getSessionUser: async () => {
    const res = await instance.get('get_session_user')
    return res.data
  },
  getNotifications: async (limit = 20) => {
    const res = await instance.get(`get_notifications&limit=${limit}`)
    return res.data
  },
  markNotificationRead: async (id) => {
    const res = await instance.post('mark_notification_read', { id })
    return res.data
  },
  markAllNotificationsRead: async () => {
    const res = await instance.get('mark_all_notifications_read')
    return res.data
  },
}

export default instance
