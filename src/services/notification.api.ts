import api from '@/services/api'

export type NotificationLevel = 'info' | 'success' | 'warning' | 'error'

export type AppNotification = {
  id: number
  type: string
  level: NotificationLevel
  title: string
  message: string | null
  booking_id: number | null
  url: string | null
  data: Record<string, unknown> | null
  read_at: string | null
  created_at: string
}

export const notificationApi = {
  async list(afterId = 0) {
    const response = await api.get('/api/v1/notifications', {
      params: afterId > 0 ? { after_id: afterId } : undefined,
    })
    return response.data.data as {
      notifications: AppNotification[]
      unread_count: number
    }
  },

  async markRead(id: number) {
    await api.post(`/api/v1/notifications/${id}/read`)
  },

  async markAllRead() {
    await api.post('/api/v1/notifications/read-all')
  },
}

export default notificationApi
