<!-- app.vue -->
<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup>
import { useTaskStore } from '~/stores/useTaskStore'

// Initialize the task store when the app starts
const taskStore = useTaskStore()
taskStore.initializeStore()
</script>