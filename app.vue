<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup>
import { useTaskStore } from '~/stores/useTaskStore'
import { useUser } from '~/composables/useUser'
import { useSyncSession } from '~/composables/useSyncSession'

console.log('App initialization starting...')

// Initialize our user state first using the sync composable
const { syncSessionData } = useSyncSession()
syncSessionData()

// Get the current user after initialization
const { getCurrentUser } = useUser()
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