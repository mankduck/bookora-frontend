<template>
  <RouterView />
  <ToastContainer />
  <GlobalRequestOverlay />
</template>

<script setup lang="ts">
import { useApp } from './App.ts'
import ToastContainer from '@/components/notifications/ToastContainer.vue'
import GlobalRequestOverlay from '@/components/system/GlobalRequestOverlay.vue'

const {
  RouterView,
} = useApp()
</script>
