<!-- components/notifications/NotificationList.vue -->

<template>
 <UCard>
  <template #header>
   <div class="flex justify-between items-center">
    <h3 class="font-medium">Notifications</h3>
    <div class="flex items-center gap-2">
     <UButton v-if="hasUnread" variant="ghost" icon="i-heroicons-check-circle" @click="markAllRead" />
     <UButton variant="ghost" :icon="isFilterOpen ? 'i-heroicons-funnel-solid' : 'i-heroicons-funnel'"
      @click="isFilterOpen = !isFilterOpen" :class="{ 'text-primary-500': activeFilters > 0 }" />
    </div>
   </div>

   <!-- Notification Filters -->
   <div v-if="isFilterOpen" class="mt-2 p-2 border rounded-md bg-gray-50">
    <div class="flex flex-wrap gap-2 mb-2">
     <UChip v-for="category in notificationCategories" :key="category.value"
      :active="selectedCategories.includes(category.value)" @click="toggleCategoryFilter(category.value)">
      {{ category.label }}
     </UChip>
    </div>
    <div class="flex items-center justify-between border-t pt-2">
     <UCheckbox v-model="showUnreadOnly" label="Unread only" />
     <UButton v-if="activeFilters > 0" size="xs" variant="link" color="primary" @click="resetFilters">
      Reset filters
     </UButton>
    </div>
   </div>
  </template>

  <div class="space-y-2">
   <div v-for="notification in filteredNotifications" :key="notification.id"
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
   <div v-if="filteredNotifications.length === 0" class="p-4 text-center text-gray-500">
    {{ emptyStateMessage }}
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

// Filter notifications based on selected criteria
const filteredNotifications = computed(() => {
 let filtered = notifications.value

 // Filter by read status if needed
 if (showUnreadOnly.value) {
  filtered = filtered.filter(notification => !notification.read)
 }

 // Filter by categories if any are selected
 if (selectedCategories.value.length > 0) {
  filtered = filtered.filter(notification => {
   // Map notification action to category
   const category = getCategoryFromAction(notification.action)
   return selectedCategories.value.includes(category)
  })
 }

 return filtered
})

// Determine category based on notification action
const getCategoryFromAction = (action) => {
 if (action.includes('comment')) return 'comment'
 if (action.includes('mentioned')) return 'mention'
 if (action.includes('assigned')) return 'assignment'
 return 'task_update' // Default category for updates, completions, etc.
}

// Count active filters
const activeFilters = computed(() => {
 let count = 0
 if (selectedCategories.value.length > 0) count++
 if (showUnreadOnly.value) count++
 return count
})

// Check if there are unread notifications
const hasUnread = computed(() => {
 return notifications.value.some(notification => !notification.read)
})

// Empty state message based on filters
const emptyStateMessage = computed(() => {
 if (activeFilters.value > 0) {
  return 'No notifications match your filters'
 }
 return 'No notifications yet'
})

// Toggle category filter
const toggleCategoryFilter = (category) => {
 if (selectedCategories.value.includes(category)) {
  selectedCategories.value = selectedCategories.value.filter(c => c !== category)
 } else {
  selectedCategories.value.push(category)
 }
}

// Reset all filters
const resetFilters = () => {
 selectedCategories.value = []
 showUnreadOnly.value = false
}

// Filter state
const isFilterOpen = ref(false)
const selectedCategories = ref([])
const showUnreadOnly = ref(false)

// Categories for filtering
const notificationCategories = [
 { label: 'Task Updates', value: 'task_update' },
 { label: 'Comments', value: 'comment' },
 { label: 'Mentions', value: 'mention' },
 { label: 'Assignments', value: 'assignment' }
]

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