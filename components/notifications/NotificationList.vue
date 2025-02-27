<!-- components/notifications/NotificationList -->

<template>
 <UCard>
  <template #header>
   <div class="flex justify-between items-center">
    <h3 class="font-medium">Notifications</h3>
    <UButton variant="ghost" icon="i-heroicons-check-circle" @click="markAllRead" />
   </div>
  </template>

  <div class="space-y-2">
   <div v-for="notification in notifications" :key="notification.id"
    class="flex items-start gap-3 p-2 rounded hover:bg-gray-50" :class="{ 'bg-blue-50': !notification.read }"
    @click="markAsRead(notification.id)">
    <UAvatar :src="notification.user.avatar" size="sm" />
    <div>
     <p class="text-sm">
      <span class="font-medium">{{ notification.user.name }}</span>
      {{ notification.action }}
      <span v-if="notification.taskTitle" class="font-medium">{{ notification.taskTitle }}</span>
     </p>
     <span class="text-xs text-gray-500">{{ formatTime(notification.time) }}</span>
    </div>
   </div>

   <!-- Empty state when no notifications exist -->
   <div v-if="notifications.length === 0" class="p-4 text-center text-gray-500">
    No notifications yet
   </div>
  </div>
 </UCard>
</template>

<script setup>
import { useNotificationStore } from '~/stores/useNotificationStore'

// Get notification store
const notificationStore = useNotificationStore()

// Get notifications from the store instead of hard-coded data
const notifications = computed(() => {
 return notificationStore.allNotifications
})

// Implement mark all read functionality
const markAllRead = () => {
 notificationStore.markAllAsRead()
}

// Mark individual notification as read when clicked
const markAsRead = (notificationId) => {
 notificationStore.markAsRead(notificationId)
}

// Format timestamp to relative time (e.g., "5m ago")
const formatTime = (timestamp) => {
 // Simple implementation - we could use date-fns for more robust formatting
 const date = new Date(timestamp)
 const now = new Date()
 const diffMs = now - date

 // Convert to appropriate units
 const diffSec = Math.floor(diffMs / 1000)
 const diffMin = Math.floor(diffSec / 60)
 const diffHour = Math.floor(diffMin / 60)
 const diffDay = Math.floor(diffHour / 24)

 if (diffDay > 0) return `${diffDay}d ago`
 if (diffHour > 0) return `${diffHour}h ago`
 if (diffMin > 0) return `${diffMin}m ago`
 return 'Just now'
}
</script>