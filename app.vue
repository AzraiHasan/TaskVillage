<script setup>
import { useTaskStore } from '~/stores/useTaskStore'

const taskStore = useTaskStore()
// Initialize store with mock data
taskStore.initializeStore()
</script>

<template>
  <div>
    <NuxtPage />
  </div>
</template>
