<!-- pages/analytics.vue -->
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
          <UTooltip text="Notifications">
            <UButton variant="ghost" icon="i-heroicons-bell" :notifications="unreadNotifications" to="/notifications" />
          </UTooltip>

          <!-- Add logout button -->
          <UTooltip text="Logout">
            <UButton variant="ghost" icon="i-heroicons-arrow-right-on-rectangle" @click="handleLogout" />
          </UTooltip>

          <UAvatar src="/placeholder-avatar.png" size="sm" />
        </div>
      </div>

      <!-- Main Content -->
      <div class="mt-6">
        <h2 class="text-2xl font-bold mb-6">Analytics Dashboard</h2>

        <!-- Workspace Selector -->
        <div class="mb-6">
          <WorkspaceSelector />
        </div>

        <!-- Analytics Content -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <!-- Task Completion Stats -->
          <TaskCompletionStats :workspace-id="workspaceId" />

          <!-- Task Status Distribution -->
          <TaskStatusDistribution :workspace-id="workspaceId" />
        </div>

        <!-- Team Productivity Metrics (Full Width) -->
        <div class="mb-6">
          <TeamProductivityMetrics :workspace-id="workspaceId" />
        </div>

        <!-- Task Trends Chart (Full Width) -->
        <div class="mb-6">
          <TaskTrendsChart :workspace-id="workspaceId" />
        </div>
      </div>
    </div>
  </UContainer>
</template>

<script setup>
import { useUser } from '~/composables/useUser'
import { useNotificationStore } from '~/stores/useNotificationStore'
import { useTaskStore } from '~/stores/useTaskStore'
import TaskCompletionStats from '~/components/analytics/TaskCompletionStats.vue'
import TaskStatusDistribution from '~/components/analytics/TaskStatusDistribution.vue'
import TeamProductivityMetrics from '~/components/analytics/TeamProductivityMetrics.vue'
import TaskTrendsChart from '~/components/analytics/TaskTrendsChart.vue'
import WorkspaceSelector from '~/components/workspace/WorkspaceSelector.vue'

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

// Get stores
const notificationStore = useNotificationStore()
const taskStore = useTaskStore()

// Get workspace ID from task store
const workspaceId = computed(() => taskStore.workspaceId)

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
    label: 'Analytics',
    to: '/analytics'
  }
]

// Set initial workspace when the page loads
onMounted(() => {
  if (!workspaceId.value) {
    taskStore.setWorkspace(1) // Set to first workspace by default
  }
})
</script>