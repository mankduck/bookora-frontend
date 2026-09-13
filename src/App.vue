<template>
  <RouterView />
</template>

<script setup lang="ts">
import { useApp } from './App.ts'

const {
  RouterView,
} = useApp()
</script>