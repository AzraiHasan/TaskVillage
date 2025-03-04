<!-- app.vue -->
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
import { useTaskStore } from '~/stores/useTaskStore'

console.log('App initialization starting...')

// Get Supabase user to know if we're authenticated
const user = useSupabaseUser()
console.log('Supabase user initialized:', user.value ? 'User authenticated' : 'No user')

// Initialize the task store when the app starts
const taskStore = useTaskStore()
console.log('Task store created, initializing...')
taskStore.initializeStore()
console.log('Task store initialized')
</script>
