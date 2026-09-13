<template>
  <Transition name="request-lock-fade">
    <div
      v-if="locked"
      class="global-request-lock"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div class="global-request-lock__panel">
        <span class="global-request-lock__spinner" aria-hidden="true"></span>
        <strong>Đang xử lý...</strong>
        <span>Vui lòng chờ hệ thống hoàn tất thao tác.</span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { requestLockState } from '@/services/requestLock'

const locked = requestLockState.locked

watch(
  locked,
  (value) => {
    document.documentElement.classList.toggle('request-locked', value)
    document.body.classList.toggle('request-locked', value)
  },
  { immediate: true },
)
</script>

<style scoped>
.global-request-lock {
  position: fixed;
  inset: 0;
  z-index: 100000;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(248, 249, 247, 0.72);
  backdrop-filter: blur(2px);
  cursor: wait;
  user-select: none;
  touch-action: none;
  overscroll-behavior: contain;
}

.global-request-lock__panel {
  min-width: min(320px, calc(100vw - 48px));
  display: grid;
  justify-items: center;
  gap: 8px;
  padding: 22px 26px;
  border: 1px solid rgba(25, 27, 23, 0.1);
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 20px 60px rgba(20, 22, 18, 0.13);
  color: #20221f;
  text-align: center;
}

.global-request-lock__panel strong {
  font-size: 15px;
}

.global-request-lock__panel > span:last-child {
  color: #777d73;
  font-size: 13px;
}

.global-request-lock__spinner {
  width: 30px;
  height: 30px;
  margin-bottom: 3px;
  border: 3px solid #e4e7e1;
  border-top-color: #566b5c;
  border-radius: 50%;
  animation: request-lock-spin 0.7s linear infinite;
}

.request-lock-fade-enter-active,
.request-lock-fade-leave-active {
  transition: opacity 0.14s ease;
}

.request-lock-fade-enter-from,
.request-lock-fade-leave-to {
  opacity: 0;
}

@keyframes request-lock-spin {
  to { transform: rotate(360deg); }
}
</style>
