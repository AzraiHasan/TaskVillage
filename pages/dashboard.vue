<!-- pages/dashboard.vue -->
<template>
  <UContainer>
    <div class="min-h-screen">
      <!-- Header -->
      <div class="flex justify-between items-center py-4">
        <div class="flex items-center gap-4">
          <h1 class="text-xl font-bold">Task Village</h1>
          <UButton size="sm" icon="i-heroicons-plus" @click="openTaskForm">
            New Task
          </UButton>
        </div>

        <div class="flex items-center gap-4">
          <!-- Link to notifications page -->
          <UTooltip text="Notifications">
            <UButton variant="ghost" icon="i-heroicons-bell" :notifications="unreadNotifications" to="/notifications" />
          </UTooltip>
          <UAvatar :src="user?.avatar || 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff'"
            size="sm" />
        </div>
      </div>

      <!-- Workspace Selector -->
      <div class="mt-4 mb-6">
        <WorkspaceSelector />
      </div>

      <!-- Notification Preview (if there are unread notifications) -->
      <div v-if="unreadNotifications > 0" class="mb-6">
        <div class="bg-blue-50 p-4 rounded-lg">
          <div class="flex justify-between items-center mb-3">
            <h3 class="font-medium text-blue-800">Recent Notifications</h3>
            <UButton variant="link" color="primary" to="/notifications" size="sm">
              View all
            </UButton>
          </div>

          <div class="space-y-2 max-h-40 overflow-y-auto">
            <div v-for="notification in recentNotifications" :key="notification.id"
              class="flex items-start gap-3 p-2 rounded hover:bg-blue-100" @click="viewNotification(notification)">
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
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="grid grid-cols-12 gap-6">
        <div class="col-span-3">
          <UCard>
            <UVerticalNavigation :items="navigationItems" />
          </UCard>
        </div>

        <div class="col-span-9">
          <UTabs :items="tabItems" @change="handleTabChange" />
          <div class="mt-4">
            <TaskFeed v-if="activeTab === 'public'" type="public" />
            <TaskFeed v-else type="private" />
          </div>
        </div>
      </div>
    </div>

    <TaskForm v-model="isTaskFormOpen" />
  </UContainer>
</template>

<script setup>
import { useTaskStore } from '~/stores/useTaskStore'
import { useNotificationStore } from '~/stores/useNotificationStore'
import { useUser } from '~/composables/useUser'

// Get notification store and user
const notificationStore = useNotificationStore()
const router = useRouter()
const { user } = useUser()

// Create computed property for unread notifications
const unreadNotifications = computed(() => {
  return notificationStore.unreadCount
})

// Get recent unread notifications (limited to 3)
const recentNotifications = computed(() => {
  return notificationStore.allNotifications
    .filter(n => !n.read)
    .slice(0, 3)
})

const taskStore = useTaskStore()
const isTaskFormOpen = ref(false)

const openTaskForm = () => {
  isTaskFormOpen.value = true
}

const navigationItems = [
  {
    label: 'Feed',
    icon: 'i-heroicons-home',
    to: '/dashboard'
  },
  {
    label: 'My Tasks',
    icon: 'i-heroicons-check-circle',
    to: '/tasks'
  },
  {
    label: 'Team',
    icon: 'i-heroicons-users',
    to: '/team'
  },
  {
    label: 'Notifications',
    icon: 'i-heroicons-bell',
    to: '/notifications',
    badge: unreadNotifications
  }
]

const tabItems = [
  {
    label: 'Public',
    icon: 'i-heroicons-globe-alt'
  },
  {
    label: 'Private',
    icon: 'i-heroicons-lock-closed'
  }
]

const activeTab = ref('public')

const handleTabChange = (index) => {
  activeTab.value = index === 0 ? 'public' : 'private'
}

// Handle clicking on a notification
const viewNotification = (notification) => {
  // Mark as read
  notificationStore.markAsRead(notification.id)

  // Navigate to related task if available
  if (notification.taskId) {
    // In a real app, navigate to the task detail page
    // For now, we'll just open the notifications page
    router.push('/notifications')
  }
}

// Format timestamp to relative time
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

// Set initial workspace and init user
onMounted(() => {
  // Initialize dev user first
  const { initializeDevUser } = useUser()
  initializeDevUser()

  // Then set workspace
  try {
    taskStore.setWorkspace(1) // Set to first workspace by default
  } catch (error) {
    console.error("Failed to set workspace:", error)
  }
})
</script>
