<!-- components/task/TaskFeed.vue -->

<script setup lang="ts">
import { useTaskStore } from '~/stores/useTaskStore'
import type { Task } from '~/stores/useTaskStore'

// Props definition for determining which tasks to show
const props = defineProps({
  type: {
    type: String as () => 'public' | 'private',
    required: true,
    validator: (value: string) => ['public', 'private'].includes(value)
  }
})

type BadgeColor = 'red' | 'yellow' | 'green' | 'blue' | 'gray' | undefined;

const taskStore = useTaskStore()
const toast = useToast()

// Create a computed property for tasks that updates reactively
const tasks = computed(() => {
  return props.type === 'public' ? taskStore.publicTasks : taskStore.privateTasks
})

// Helper function to determine status badge color
const getStatusColor = (status: string): BadgeColor | undefined => {
  const statusColors: Record<string, BadgeColor> = {
    not_started: undefined,
    in_progress: 'blue',
    in_review: 'yellow',
    completed: 'green'
  }
  return statusColors[status]
}

// Helper function to format status text for display
const formatStatus = (status: string): string => {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Progress-related utilities
const progressConfig = {
  levels: [
    { threshold: 75, color: 'green', label: 'Almost there!' },
    { threshold: 50, color: 'blue', label: 'Good progress' },
    { threshold: 25, color: 'yellow', label: 'In progress' },
    /* { threshold: 0, color: 'gray', label: 'Just started' } */
  ] as const
}

// Get progress information based on current progress value
const getProgressInfo = (progress: number) => {
  const level = progressConfig.levels.find(level => progress >= level.threshold) 
                ?? progressConfig.levels[progressConfig.levels.length - 1]
  return level
}

// Days left calculation and urgency utilities
const getDaysLeft = (dueDate: string | null): number | null => {
  if (!dueDate) return null
  try {
    const due = new Date(dueDate)
    const now = new Date()
    // Set hours to midnight for consistent day calculation
    due.setHours(0, 0, 0, 0)
    now.setHours(0, 0, 0, 0)
    const diffTime = due.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  } catch (error) {
    console.error('Error calculating days left:', error)
    return null
  }
}

const getUrgencyInfo = (daysLeft: number | null) => {
  console.log('Days left:', daysLeft)
  if (daysLeft === null) return { color: undefined as BadgeColor, label: 'No due date' }
  if (daysLeft <= 1) return { color: 'red' as BadgeColor, label: `${daysLeft <= 0 ? 'Overdue' : '1 day left'}` }
  if (daysLeft <= 3) return { color: 'yellow' as BadgeColor, label: `${daysLeft} days left` }
  if (daysLeft <= 7) return { color: 'blue' as BadgeColor, label: `${daysLeft} days left` }
  return { color: 'green' as BadgeColor, label: `${daysLeft} days left` }
}

// Handle progress updates
const updateProgress = async (taskId: number, progress: number) => {
  try {
    const success = taskStore.updateTaskProgress(taskId, progress)
    if (!success) throw new Error('Failed to update task progress')

    toast.add({
      title: 'Progress Updated',
      description: `Task is now ${progress}% complete`,
      color: 'green'
    })
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Could not update task progress',
      color: 'red'
    })
  }
}
</script>

<template>
  <div class="space-y-4">
    <UCard v-for="task in tasks" :key="task.id" class="hover:shadow-lg transition-shadow duration-200">
      <!-- Card Header -->
      <template #header>
        <div class="flex justify-between items-center">
          <div>
            <h3 class="font-semibold text-lg">{{ task.title }}</h3>
            <p class="text-sm text-gray-500">Assigned to {{ task.assignee.name }}</p>
            <!-- Add the due date information below the assignee -->
            <div v-if="task.dueDate" class="flex items-center gap-2 mt-2">
              <span class="text-sm text-gray-600">Due:</span>
              <UBadge :color="getUrgencyInfo(getDaysLeft(task.dueDate)).color" size="sm" class="whitespace-nowrap">
                {{ getUrgencyInfo(getDaysLeft(task.dueDate)).label }}
              </UBadge>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <!-- Status Badge -->
            <UBadge :color="getStatusColor(task.status)" size="sm">
              {{ formatStatus(task.status) }}
            </UBadge>
            <!-- Priority Badge -->
            <UBadge :color="task.priority === 'high' ? 'red' : 'yellow'" size="sm">
              {{ task.priority }}
            </UBadge>
          </div>
        </div>
      </template>

      <!-- Task Description -->
      <p class="text-gray-600 mb-4">{{ task.description }}</p>

      <!-- Progress Section -->
      <div v-if="task.status === 'in_progress'" class="mb-4 space-y-2">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600">Progress</span>
            <UBadge :color="getProgressInfo(task.progress).color" size="sm" variant="subtle">
              {{ getProgressInfo(task.progress).label }}
            </UBadge>
          </div>
          <span class="text-sm font-medium">{{ task.progress }}%</span>
        </div>

        <UProgress :value="task.progress" :color="getProgressInfo(task.progress).color" :ui="{
            base: 'relative w-full',
            track: 'bg-gray-100 dark:bg-gray-800',
            bar: 'transition-all ease-in-out duration-300'
          }" />

        <!-- Progress Update Buttons -->
        <div class="flex gap-2 mt-2">
          <UButton v-for="testProgress in [25, 50, 75, 100]" :key="testProgress" size="xs" variant="soft"
            :color="getProgressInfo(testProgress).color" :disabled="task.progress === testProgress"
            @click="updateProgress(task.id, testProgress)">
            {{ testProgress }}%
          </UButton>
        </div>
      </div>

      <!-- Card Footer -->
      <template #footer>
        <div class="flex justify-between items-center">
          <TaskInteractions :task-id="task.id" :likes="task.likes" :comments="task.comments"
            :assignee="task.assignee" />
          <UButton v-if="task.status !== 'completed'" icon="i-heroicons-pencil" color="gray" variant="ghost"
            size="sm" />
        </div>
      </template>
    </UCard>

    <!-- Empty State -->
    <div v-if="tasks.length === 0" class="text-center py-8">
      <p class="text-gray-500">No tasks found</p>
    </div>
  </div>
</template>