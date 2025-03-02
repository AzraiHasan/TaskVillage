<!-- app.vue -->
<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup>
import { useTaskStore } from '~/stores/useTaskStore'
import { useUser } from '~/composables/useUser'

console.log('App initialization starting...')

// Initialize our user state first
const { initializeDevUser, getCurrentUser } = useUser()
initializeDevUser()

// Get the current user after initialization
const currentUser = getCurrentUser()
console.log('User initialized, current user:', currentUser || 'No user found')

// Initialize the task store when the app starts
const taskStore = useTaskStore()
console.log('Task store created, initializing...')
taskStore.initializeStore()
console.log('Task store initialized')

// Apply auth middleware globally
defineNuxtPlugin(() => {
  addRouteMiddleware('auth', auth, { global: true })
})
</script>