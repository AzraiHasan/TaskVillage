<!-- components/notifications/NotificationCenter.vue -->

<template>
  <UCard class="max-w-3xl mx-auto">
    <template #header>
      <div class="flex justify-between items-center">
        <h2 class="text-lg font-medium">Notifications</h2>
        <div class="flex items-center gap-2">
          <UTabs v-model="activeTab" :items="tabItems" />
        </div>
      </div>
    </template>

    <div class="flex flex-col md:flex-row gap-4">
      <!-- Main Notification List -->
      <div class="flex-1">
        <div v-if="activeTab === 0">
          <!-- All Notifications -->
          <NotificationList />
        </div>
        <div v-else-if="activeTab === 1">
          <!-- Unread Notifications -->
          <div class="space-y-2">
            <div v-for="notification in unreadNotifications" :key="notification.id"
              class="flex items-start gap-3 p-3 rounded bg-blue-50 hover:bg-blue-100"
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

            <div v-if="unreadNotifications.length === 0" class="p-4 text-center text-gray-500">
              No unread notifications
            </div>
          </div>
        </div>
        <div v-else-if="activeTab === 2">
          <!-- Notification Preferences -->
          <NotificationPreferences />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-between">
        <UBadge v-if="activeTab !== 2" :color="getBadgeColor()" class="self-start">
          {{ getFooterText() }}
        </UBadge>
        <div class="flex gap-2">
          <UButton v-if="activeTab === 1 && unreadNotifications.length > 0" size="sm" color="primary"
            @click="markAllAsRead">
            Mark all as read
          </UButton>
        </div>
      </div>
    </template>
  </UCard>
</template>

<script setup>
import { useNotificationStore } from '~/stores/useNotificationStore'
import NotificationList from '~/components/notifications/NotificationList.vue'
import NotificationPreferences from '~/components/notifications/NotificationPreferences.vue'

// Tabs setup
const tabItems = [
  {
    label: 'All',
    icon: 'i-heroicons-bell'
  },
  {
    label: 'Unread',
    icon: 'i-heroicons-bell-alert'
  },
  {
    label: 'Preferences',
    icon: 'i-heroicons-cog-6-tooth'
  }
]

const activeTab = ref(0)
const notificationStore = useNotificationStore()

// Computed properties
const unreadNotifications = computed(() => {
  return notificationStore.allNotifications.filter(n => !n.read)
})

// Methods
const markAsRead = (notificationId) => {
  notificationStore.markAsRead(notificationId)
}

const markAllAsRead = () => {
  notificationStore.markAllAsRead()
}

// Helper methods
const getFooterText = () => {
  if (activeTab.value === 0) {
    return `${notificationStore.allNotifications.length} total notifications`
  } else if (activeTab.value === 1) {
    return `${unreadNotifications.value.length} unread notifications`
  }
  return ''
}

const getBadgeColor = () => {
  if (activeTab.value === 1 && unreadNotifications.value.length > 0) {
    return 'red'
  }
  return 'gray'
}

// Format timestamp to relative time (e.g., "5m ago")
const formatTime = (timestamp) => {
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