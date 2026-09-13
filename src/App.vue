<template>
  <RouterView />
  <ToastContainer />
</template>

<script setup lang="ts">
import { useApp } from './App.ts'
import ToastContainer from '@/components/notifications/ToastContainer.vue'

const {
  RouterView,
} = useApp()
</script>