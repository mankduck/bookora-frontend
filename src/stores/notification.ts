import { defineStore } from 'pinia'
import notificationApi, { type AppNotification } from '@/services/notification.api'

export type ToastItem = AppNotification & { toastId: number }

let pollTimer: number | null = null
let toastSequence = 0

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    items: [] as AppNotification[],
    toasts: [] as ToastItem[],
    unreadCount: 0,
    initialized: false,
    loading: false,
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
        this.items = data.notifications
        this.unreadCount = data.unread_count
        this.initialized = true
      } finally {
        this.loading = false
      }
    },

    async poll() {
      if (!this.initialized) {
        await this.loadInitial()
        return
      }

      try {
        const data = await notificationApi.list(this.latestId)
        if (data.notifications.length) {
          const incoming = [...data.notifications].sort((a, b) => a.id - b.id)
          this.items = [...incoming.reverse(), ...this.items]
          for (const notification of incoming.reverse()) {
            this.pushToast(notification)
          }
        }
        this.unreadCount = data.unread_count
      } catch {
        // Session hết hạn hoặc mạng tạm ngắt: lần poll sau sẽ thử lại.
      }
    },

    async start() {
      if (!this.initialized) {
        await this.loadInitial()
      }
      if (pollTimer === null) {
        pollTimer = window.setInterval(() => this.poll(), 3000)
      }
    },

    stop() {
      if (pollTimer !== null) {
        window.clearInterval(pollTimer)
        pollTimer = null
      }
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
