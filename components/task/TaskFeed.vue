<!-- components/task/TaskFeed.vue -->
<template>
  <div class="space-y-4">
    <!-- Filters -->
    <div class="flex space-x-4 mb-4">
      <USelect v-model="filters.status" :options="statusOptions" placeholder="Filter by Status" />
      <USelect v-model="filters.priority" :options="priorityOptions" placeholder="Filter by Priority" />
    </div>

    <!-- Task Cards -->
    <UCard v-for="task in filteredTasks" :key="task.id" class="hover:shadow-lg transition-shadow duration-200">
      <!-- Card Header -->
      <template #header>
        <div class="flex justify-between items-center">
          <div>
            <h3 class="font-semibold text-lg">{{ task.title }}</h3>
            <p class="text-sm text-gray-500">Assigned to {{ task.assignee.name }}</p>
            <!-- Due Date -->
            <div v-if="task.dueDate" class="flex items-center gap-2 mt-2">
              <span class="text-sm text-gray-600">Due:</span>
              <UBadge :color="getUrgencyInfo(getDaysLeft(task.dueDate)).color" size="sm" class="whitespace-nowrap">
                {{ getUrgencyInfo(getDaysLeft(task.dueDate)).label }}
              </UBadge>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <UBadge :color="getStatusColor(task.status)" size="sm">
              {{ formatStatus(task.status) }}
            </UBadge>
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
          <UButton v-for="increment in [25, 50, 75, 100]" :key="increment" size="xs" variant="soft"
            :color="getProgressInfo(increment).color" :disabled="task.progress === increment"
            @click="updateProgress(task.id, increment)">
            {{ increment }}%
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
    <div v-if="filteredTasks.length === 0" class="text-center py-8">
      <p class="text-gray-500">
        {{ workspaceMessage }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTaskStore, STATUSES, PRIORITIES } from '~/stores/useTaskStore'
import type { Task } from '~/stores/useTaskStore'
import { parseISO, startOfDay, differenceInDays } from 'date-fns'

type Status = typeof STATUSES[number]
type Priority = typeof PRIORITIES[number]
type BadgeColor = 'red' | 'yellow' | 'green' | 'blue' | 'gray' | undefined

const props = defineProps<{
  type?: 'public' | 'private'
}>()

const taskStore = useTaskStore()

// Filters
const filters = reactive({
  status: '' as Status | '',
  priority: '' as Priority | ''
})

watch(filters, (newFilters) => {
  taskStore.updateFilters({
    status: newFilters.status || null,
    priority: newFilters.priority || null
  })
}, { deep: true })

const formatStatus = (status: string): string => {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Filter Options
const statusOptions = STATUSES.map(status => ({
  label: formatStatus(status),
  value: status
}))

const priorityOptions = PRIORITIES.map(priority => ({
  label: priority.charAt(0).toUpperCase() + priority.slice(1),
  value: priority
}))

// Tasks
const filteredTasks = computed(() => {
  if (props.type === 'private') {
    return taskStore.privateTasks
  }
  return taskStore.publicTasks
})

// Progress Configuration
const progressConfig = {
  levels: [
    { threshold: 75, color: 'green', label: 'Almost there!' },
    { threshold: 50, color: 'blue', label: 'Good progress' },
    { threshold: 25, color: 'yellow', label: 'In progress' },
  ] as const
}

// Utility Functions
const getProgressInfo = (progress: number) => {
  const level = progressConfig.levels.find(level => progress >= level.threshold) 
    ?? { threshold: 0, color: 'sky' as const, label: 'Just started' }
  return level
}

const getDaysLeft = (dueDate: string | null): number | null => {
  if (!dueDate) return null
  try {
    const due = parseISO(dueDate) // Use parseISO instead of new Date()
    const now = new Date()
    const startOfDue = startOfDay(due)
    const startOfNow = startOfDay(now)
    const diffTime = differenceInDays(startOfDue, startOfNow)
    return diffTime
  } catch (error) {
    console.error('Error calculating days left:', error)
    return null
  }
}

const getUrgencyInfo = (daysLeft: number | null) => {
  if (daysLeft === null) return { color: undefined as BadgeColor, label: 'No due date' }
  if (daysLeft <= 1) return { color: 'red' as BadgeColor, label: `${daysLeft <= 0 ? 'Overdue' : '1 day left'}` }
  if (daysLeft <= 3) return { color: 'yellow' as BadgeColor, label: `${daysLeft} days left` }
  if (daysLeft <= 7) return { color: 'blue' as BadgeColor, label: `${daysLeft} days left` }
  return { color: 'green' as BadgeColor, label: `${daysLeft} days left` }
}

const getStatusColor = (status: string): BadgeColor => {
  const statusColors: Record<string, BadgeColor> = {
    not_started: undefined,
    in_progress: 'blue',
    in_review: 'yellow',
    completed: 'green'
  }
  return statusColors[status]
}



// Progress Updates
const updateProgress = async (taskId: number, progress: number) => {
  try {
    const success = await taskStore.updateTaskProgress(taskId, progress)
    if (!success) throw new Error('Failed to update task progress')

    const toast = useToast()
    toast.add({
      title: 'Progress Updated',
      description: `Task is now ${progress}% complete`,
      color: 'green'
    })
  } catch (error) {
    const toast = useToast()
    toast.add({
      title: 'Error',
      description: 'Could not update task progress',
      color: 'red'
    })
  }
}

// Workspace Message
const workspaceMessage = computed(() => {
  if (!taskStore.workspaceId) {
    return 'Please select a workspace'
  }
  return 'No tasks in this workspace'
})
</script>