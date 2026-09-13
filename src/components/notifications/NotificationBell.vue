<template>
  <div class="notification-bell" @click.stop>
    <button class="notification-bell__button" type="button" aria-label="Thông báo" @click="open = !open">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
      </svg>
      <span v-if="store.unreadCount" class="notification-bell__count">
        {{ store.unreadCount > 99 ? '99+' : store.unreadCount }}
      </span>
    </button>

    <div v-if="open" class="notification-panel">
      <div class="notification-panel__header">
        <div>
          <strong>Thông báo</strong>
          <span>{{ store.unreadCount }} chưa đọc</span>
        </div>
        <button v-if="store.unreadCount" type="button" @click="store.markAllRead()">Đọc tất cả</button>
      </div>

      <div v-if="store.items.length" class="notification-panel__list">
        <button
          v-for="item in store.items"
          :key="item.id"
          type="button"
          class="notification-item"
          :class="{ 'is-unread': !item.read_at }"
          @click="openNotification(item)"
        >
          <span class="notification-item__dot" :class="`is-${item.level}`"></span>
          <span class="notification-item__body">
            <strong>{{ item.title }}</strong>
            <span v-if="item.message">{{ item.message }}</span>
            <small>{{ formatTime(item.created_at) }}</small>
          </span>
        </button>
      </div>

      <div v-else class="notification-panel__empty">Chưa có thông báo.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'
import { useAuthStore } from '@/stores/auth'
import type { AppNotification } from '@/services/notification.api'

const store = useNotificationStore()
const auth = useAuthStore()
const router = useRouter()
const open = ref(false)

const close = () => { open.value = false }

const openNotification = async (item: AppNotification) => {
  await store.markRead(item)
  open.value = false
  if (item.url) await router.push(item.url)
}

const formatTime = (value: string) => {
  const date = new Date(value)
  const diff = Math.max(0, Date.now() - date.getTime())
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Vừa xong'
  if (minutes < 60) return `${minutes} phút trước`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} giờ trước`
  return date.toLocaleDateString('vi-VN')
}

onMounted(() => {
  document.addEventListener('click', close)
  store.start(auth.user?.id)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', close)
  store.stop()
})
</script>
