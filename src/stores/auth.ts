import { defineStore } from 'pinia'
import api from '@/services/api'
import { useNotificationStore } from '@/stores/notification'

type Role = {
  id: number
  name: string
  code: string
}

type User = {
  id: number
  name: string
  email: string | null
  phone: string | null
  avatar: string | null
  status: string
  roles: Role[]
}

type LoginPayload = {
  login: string
  password: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    loading: false,
    initialized: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,

    isAdmin: (state) =>
      state.user?.roles?.some((role) => role.code === 'admin') ?? false,

    isStaff: (state) =>
      state.user?.roles?.some((role) => role.code === 'staff') ?? false,

    isCustomer: (state) =>
      state.user?.roles?.some((role) => role.code === 'customer') ?? false,
  },

  actions: {
    async csrf() {
      await api.get('/sanctum/csrf-cookie')
    },

    async login(payload: LoginPayload) {
      this.loading = true

      try {
        await this.csrf()

        const response = await api.post('/api/v1/auth/login', payload)

        this.user = response.data.data.user

        return response.data
      } finally {
        this.loading = false
      }
    },

    async fetchMe() {
      try {
        const response = await api.get('/api/v1/auth/me')

        this.user = response.data.data.user
      } catch {
        this.user = null
      } finally {
        this.initialized = true
      }
    },

    async logout() {
      try {
        await api.post('/api/v1/auth/logout')
      } finally {
        this.user = null
        useNotificationStore().reset()
      }
    },
  },
})