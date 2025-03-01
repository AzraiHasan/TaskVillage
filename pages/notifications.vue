<!-- pages/notifications.vue -->
<template>
  <UContainer>
    <div class="min-h-screen">
      <!-- Header -->
      <div class="flex justify-between items-center py-4">
        <div class="flex items-center gap-4">
          <h1 class="text-xl font-bold">Task Village</h1>
          <UBreadcrumb :items="breadcrumbItems" />
        </div>

        <div class="flex items-center gap-4">
          <UButton variant="ghost" icon="i-heroicons-bell" :notifications="unreadNotifications" />

          <!-- Add logout button -->
          <UTooltip text="Logout">
            <UButton variant="ghost" icon="i-heroicons-arrow-right-on-rectangle" @click="handleLogout" />
          </UTooltip>

          <UAvatar src="/placeholder-avatar.png" size="sm" />
        </div>
      </div>

      <!-- Main Content -->
      <div class="mt-8">
        <NotificationCenter />
      </div>
    </div>
  </UContainer>
</template>

<script setup>
import { useNotificationStore } from '~/stores/useNotificationStore'
import NotificationCenter from '~/components/notifications/NotificationCenter.vue'
import { useUser } from '~/composables/useUser'

// Get user composable
const { logout } = useUser()
const toast = useToast()

// Handle logout
const handleLogout = async () => {
  try {
    await logout()
    toast.add({
      title: 'Success',
      description: 'You have been logged out',
      color: 'green'
    })
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to log out. Please try again.',
      color: 'red'
    })
  }
}

// Get notification store
const notificationStore = useNotificationStore()

// Create computed property for unread notifications
const unreadNotifications = computed(() => {
  return notificationStore.unreadCount
})

// Breadcrumb items
const breadcrumbItems = [
  {
    label: 'Dashboard',
    to: '/dashboard'
  },
  {
    label: 'Notifications',
    to: '/notifications'
  }
]
</script>