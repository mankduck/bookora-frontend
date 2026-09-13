import { defineStore } from 'pinia'
import notificationApi, { type AppNotification } from '@/services/notification.api'
import { realtimeNotifications } from '@/services/realtime'
import { useSiteStore } from '@/stores/site'

export type ToastItem = AppNotification & { toastId: number }

let toastSequence = 0

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    items: [] as AppNotification[],
    toasts: [] as ToastItem[],
    unreadCount: 0,
    initialized: false,
    loading: false,
    connectedUserId: null as number | null,
  }),

  getters: {
    latestId: (state) => state.items.reduce((max, item) => Math.max(max, item.id), 0),
  },

  actions: {
    async loadInitial() {
      if (this.loading) return
      this.loading = true
      try {
        const data = await notificationApi.list()
        const merged = [...data.notifications, ...this.items]
        const byId = new Map(merged.map((item) => [item.id, item]))
        this.items = [...byId.values()].sort((a, b) => b.id - a.id).slice(0, 50)
        this.unreadCount = data.unread_count
        this.initialized = true
      } finally {
        this.loading = false
      }
    },

    receive(notification: AppNotification) {
      if (this.items.some((item) => item.id === notification.id)) return

      this.items = [notification, ...this.items].slice(0, 50)
      if (!notification.read_at) this.unreadCount += 1
      this.pushToast(notification)

      if (notification.type === 'site_updated') {
        useSiteStore().load(true)
      }

      window.dispatchEvent(new CustomEvent('bookora:notification', {
        detail: notification,
      }))
    },

    async start(userId?: number | null) {
      if (!userId) return

      if (this.connectedUserId !== userId) {
        realtimeNotifications.connect(userId, (notification) => {
          this.receive(notification)
        })
        this.connectedUserId = userId
      }

      if (!this.initialized) {
        await this.loadInitial()
      }
    },

    stop() {
      realtimeNotifications.disconnect()
      this.connectedUserId = null
    },

    pushToast(notification: AppNotification) {
      const toast = { ...notification, toastId: ++toastSequence }
      this.toasts.push(toast)
      window.setTimeout(() => this.dismissToast(toast.toastId), 5500)
    },

    dismissToast(toastId: number) {
      this.toasts = this.toasts.filter((item) => item.toastId !== toastId)
    },

    async markRead(notification: AppNotification) {
      if (!notification.read_at) {
        await notificationApi.markRead(notification.id)
        const item = this.items.find((entry) => entry.id === notification.id)
        if (item) item.read_at = new Date().toISOString()
        this.unreadCount = Math.max(0, this.unreadCount - 1)
      }
    },

    async markAllRead() {
      if (!this.unreadCount) return
      await notificationApi.markAllRead()
      const now = new Date().toISOString()
      this.items.forEach((item) => { if (!item.read_at) item.read_at = now })
      this.unreadCount = 0
    },

    reset() {
      this.stop()
      this.items = []
      this.toasts = []
      this.unreadCount = 0
      this.initialized = false
    },
  },
})
