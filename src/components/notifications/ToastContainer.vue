<template>
  <div class="toast-stack" aria-live="polite">
    <button
      v-for="toast in store.toasts"
      :key="toast.toastId"
      type="button"
      class="app-toast"
      :class="`is-${toast.level}`"
      @click="openToast(toast)"
    >
      <span class="app-toast__icon">{{ icon(toast.level) }}</span>
      <span class="app-toast__body">
        <strong>{{ toast.title }}</strong>
        <span v-if="toast.message">{{ toast.message }}</span>
      </span>
      <span class="app-toast__close" @click.stop="store.dismissToast(toast.toastId)">×</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useNotificationStore, type ToastItem } from '@/stores/notification'
import type { NotificationLevel } from '@/services/notification.api'

const store = useNotificationStore()
const router = useRouter()

const icon = (level: NotificationLevel) => ({ success: '✓', warning: '!', error: '×', info: 'i' })[level]

const openToast = async (toast: ToastItem) => {
  store.dismissToast(toast.toastId)
  await store.markRead(toast)
  if (toast.url) await router.push(toast.url)
}
</script>
