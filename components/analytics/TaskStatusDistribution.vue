<!-- components/analytics/TaskStatusDistribution.vue -->
<template>
  <UCard>
    <template #header>
      <h3 class="font-medium">Task Status Distribution</h3>
    </template>

    <div class="space-y-4">
      <!-- Status Bars -->
      <div v-for="status in statusData" :key="status.name" class="space-y-1">
        <div class="flex justify-between text-sm">
          <div class="flex items-center">
            <div :class="getStatusIconClass(status.key)" class="w-3 h-3 rounded-full mr-2"></div>
            <span>{{ formatStatus(status.key) }}</span>
          </div>
          <span>{{ status.count }} ({{ status.percentage }}%)</span>
        </div>
        <UProgress :value="status.percentage" :color="getStatusColor(status.key)" :ui="{
          base: 'relative w-full',
          track: 'bg-gray-100 dark:bg-gray-800',
          bar: 'transition-all ease-in-out duration-300'
        }" />
      </div>

      <!-- No Tasks Message -->
      <div v-if="statusData.length === 0" class="text-center py-4 text-gray-500">
        No tasks available in the selected workspace
      </div>

      <!-- Legend -->
      <div class="flex flex-wrap gap-4 pt-2 border-t">
        <div v-for="status in statusData" :key="status.name" class="flex items-center">
          <div :class="getStatusIconClass(status.key)" class="w-2 h-2 rounded-full mr-2"></div>
          <span class="text-xs text-gray-600">{{ formatStatus(status.key) }}</span>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup>
import { useTaskStore, STATUSES } from '~/stores/useTaskStore'

const props = defineProps({
  workspaceId: {
    type: Number,
    default: null
  }
})

const taskStore = useTaskStore()

// Get tasks filtered by workspace if provided
const filteredTasks = computed(() => {
  return props.workspaceId 
    ? taskStore.tasks.filter(task => task.workspaceId === props.workspaceId)
    : taskStore.tasks
})

// Calculate status distribution
const statusData = computed(() => {
  const totalCount = filteredTasks.value.length
  
  if (totalCount === 0) return []
  
  // Count tasks by status
  const statusCounts = {}
  STATUSES.forEach(status => {
    statusCounts[status] = 0
  })
  
  filteredTasks.value.forEach(task => {
    if (statusCounts[task.status] !== undefined) {
      statusCounts[task.status]++
    }
  })
  
  // Create data array for the chart
  return STATUSES
    .map(status => {
      const count = statusCounts[status]
      const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0
      
      return {
        key: status,
        count,
        percentage
      }
    })
    // Only include statuses that have at least one task
    .filter(item => item.count > 0)
})

// Format status for display
const formatStatus = (status) => {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Get status color for the progress bar
const getStatusColor = (status) => {
  const statusColors = {
    not_started: 'gray',
    in_progress: 'blue',
    in_review: 'yellow',
    completed: 'green',
    canceled: 'red'
  }
  return statusColors[status]
}

// Get CSS class for status indicator
const getStatusIconClass = (status) => {
  const baseClasses = 'inline-block rounded-full'
  const statusClasses = {
    not_started: 'bg-gray-400',
    in_progress: 'bg-blue-400',
    in_review: 'bg-yellow-400',
    completed: 'bg-green-400',
    canceled: 'bg-red-400'
  }
  return `${baseClasses} ${statusClasses[status]}`
}
</script>
