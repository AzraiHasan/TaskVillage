<!-- components/notifications/NotificationPreferences -->

<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="font-medium">Notification Preferences</h3>
      </div>
    </template>

    <div class="space-y-4">
      <div>
        <h4 class="text-sm font-medium mb-2">Notification Categories</h4>
        <p class="text-xs text-gray-500 mb-3">Select which types of notifications you want to receive</p>

        <div class="space-y-2">
          <UCheckbox v-model="preferences.enabledCategories" value="task_update" label="Task Updates"
            help="Notifications about task creation, completion, and status changes" />

          <UCheckbox v-model="preferences.enabledCategories" value="comment" label="Comments"
            help="Notifications about new comments on tasks" />

          <UCheckbox v-model="preferences.enabledCategories" value="mention" label="Mentions"
            help="Notifications when someone mentions you" />

          <UCheckbox v-model="preferences.enabledCategories" value="assignment" label="Assignments"
            help="Notifications when you're assigned to a task" />
        </div>
      </div>

      <UDivider />

      <div>
        <h4 class="text-sm font-medium mb-2">Notification Delivery</h4>
        <UCheckbox v-model="preferences.emailNotifications" label="Email Notifications"
          help="Send notifications to your email (for demo purposes)" />
      </div>

      <UDivider />

      <div>
        <h4 class="text-sm font-medium mb-2">Notification Management</h4>
        <div class="space-y-2">
          <UButton block size="sm" color="gray" @click="markAllAsRead">
            Mark all as read
          </UButton>

          <UButton block size="sm" color="red" variant="soft" @click="confirmClearAll">
            Clear all notifications
          </UButton>
        </div>
      </div>
    </div>
  </UCard>

  <!-- Confirmation Modal -->
  <UModal v-model="isConfirmOpen">
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-medium">Clear All Notifications</h3>
        </div>
      </template>

      <p class="mb-4">Are you sure you want to clear all notifications? This action cannot be undone.</p>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton color="gray" variant="ghost" @click="isConfirmOpen = false">
            Cancel
          </UButton>
          <UButton color="red" @click="clearAllNotifications">
            Confirm
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import { useNotificationStore, type NotificationCategory } from '~/stores/useNotificationStore'

const notificationStore = useNotificationStore()
const toast = useToast()
const isConfirmOpen = ref(false)

// Create a reactive copy of preferences to track changes
const preferences = reactive({
  enabledCategories: [...notificationStore.preferences.enabledCategories],
  emailNotifications: notificationStore.preferences.emailNotifications
})

// Watch for changes and update the store
watch(preferences, (newPreferences) => {
  notificationStore.updatePreferences({
    enabledCategories: [...newPreferences.enabledCategories],
    emailNotifications: newPreferences.emailNotifications
  })
}, { deep: true })

// Mark all notifications as read
const markAllAsRead = () => {
  notificationStore.markAllAsRead()
  toast.add({
    title: 'Success',
    description: 'All notifications marked as read',
    color: 'green'
  })
}

// Confirm clear all notifications
const confirmClearAll = () => {
  isConfirmOpen.value = true
}

// Clear all notifications
const clearAllNotifications = () => {
  // Clear each category one by one
  const categories = ['task_update', 'comment', 'mention', 'assignment'] as NotificationCategory[]
  categories.forEach(category => {
    notificationStore.clearByCategory(category)
  })
  
  toast.add({
    title: 'Success',
    description: 'All notifications cleared',
    color: 'green'
  })
  isConfirmOpen.value = false
}
</script>