<!-- components/task/TaskFeed.vue -->
<template>
  <div class="space-y-4">
    <!-- Filters -->
    <div class="flex space-x-4 mb-4">
      <USelect v-model="filters.status" :options="statusOptions" placeholder="Filter by Status" />
      <USelect v-model="filters.priority" :options="priorityOptions" placeholder="Filter by Priority" />
    </div>

    <!-- Task Cards -->
    <UCard v-for="task in filteredTasks" :key="task.id" class="hover:shadow-lg transition-shadow duration-200" :class="{ 
    'opacity-75': task.status === 'completed' || task.status === 'canceled',
    'border-l-4 border-l-green-500': task.status === 'completed',
    'border-l-4 border-l-red-500': task.status === 'canceled'
  }">
      <!-- Card Header -->
      <template #header>
        <div class="flex justify-between items-center">
          <div>
            <h3 class="font-semibold text-lg" :class="{ 'line-through': task.status === 'canceled' }">
              {{ task.title }}
            </h3>
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
              <span class="flex items-center gap-1">
                <Icon :name="getStatusIcon(task.status)" class="w-4 h-4" />
                {{ formatStatus(task.status) }}
              </span>
            </UBadge>
            <UBadge :color="task.priority === 'high' ? 'red' : 'yellow'" size="sm">
              {{ task.priority }}
            </UBadge>
          </div>
        </div>
      </template>

      <!-- Task Description -->
      <p class="text-gray-600 mb-4" :class="{ 'line-through': task.status === 'canceled' }">
        {{ task.description }}
      </p>

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
          <UDropdown v-if="task.status !== 'completed' && task.status !== 'canceled'" :items="getTaskActionItems(task)"
            :popper="{ placement: 'bottom-end' }">
            <UButton icon="i-heroicons-ellipsis-vertical" color="gray" variant="ghost" size="sm" />
          </UDropdown>
        </div>
      </template>
    </UCard>

    <!-- Empty State -->
    <div v-if="filteredTasks.length === 0" class="text-center py-8">
      <p class="text-gray-500">
        {{ workspaceMessage }}
      </p>
    </div>

    <UModal v-model="isCancelModalOpen">
      <UCard>
        <template #header>
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium">Cancel Task</h3>
          </div>
        </template>

        <p class="mb-4">Are you sure you want to cancel this task? This action cannot be undone.</p>

        <UFormGroup label="Reason (Optional)" name="cancelReason">
          <UTextarea v-model="cancelReason" placeholder="Why is this task being canceled?" :rows="3" />
        </UFormGroup>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton color="gray" variant="ghost" @click="isCancelModalOpen = false">
              Cancel
            </UButton>
            <UButton color="red" @click="confirmCancelTask">
              Confirm
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <TaskForm v-model="isEditModalOpen" :edit-mode="true" :task-to-edit="selectedTask" />
  </div>
</template>

<script setup lang="ts">
import { useTaskStore, STATUSES, PRIORITIES } from '~/stores/useTaskStore'
import { parseISO, startOfDay, differenceInDays } from 'date-fns'
import TaskInteractions from './TaskInteractions.vue'
import TaskForm from '~/components/task/TaskForm.vue'

type Status = typeof STATUSES[number]
type Priority = typeof PRIORITIES[number]
type BadgeColor = 'red' | 'yellow' | 'green' | 'blue' | 'gray' | undefined

const props = defineProps<{
  type?: 'public' | 'private'
}>()

const taskStore = useTaskStore()

// State for edit and cancel modals
const isEditModalOpen = ref(false)
const isCancelModalOpen = ref(false)
const selectedTaskId = ref<number | null>(null)
const selectedTask = ref<Task | null>(null)
const cancelReason = ref('')

const completeTask = async (taskId: number) => {
  try {
    await taskStore.completeTask(taskId)
    
    const toast = useToast()
    toast.add({
      title: 'Task Completed',
      description: 'The task has been marked as completed',
      color: 'green'
    })
  } catch (error) {
    const { handleError } = useErrorHandler()
    handleError(error)
  }
}

const getTaskActionItems = (task: Task) => {
  return [[
    {
      label: 'Complete',
      icon: 'i-heroicons-check-circle',
      click: () => completeTask(task.id)
    },
    {
      label: 'Edit',
      icon: 'i-heroicons-pencil', 
      click: () => editTask(task)
    },
    {
      label: 'Cancel',
      icon: 'i-heroicons-x-circle',
      color: 'red',
      click: () => showCancelConfirm(task.id)
    }
  ]]
}

const editTask = (task: Task) => {
  selectedTask.value = { ...task } // Create a copy to avoid direct reference
  isEditModalOpen.value = true
}

const showCancelConfirm = (taskId: number) => {
  selectedTaskId.value = taskId
  cancelReason.value = ''
  isCancelModalOpen.value = true
}

const confirmCancelTask = async () => {
  if (!selectedTaskId.value) return
  
  try {
    await taskStore.cancelTask(selectedTaskId.value, cancelReason.value)
    
    const toast = useToast()
    toast.add({
      title: 'Task Canceled',
      description: 'The task has been canceled',
      color: 'blue'
    })
    
    isCancelModalOpen.value = false
    selectedTaskId.value = null
    cancelReason.value = ''
  } catch (error) {
    const { handleError } = useErrorHandler()
    handleError(error)
  }
}

// Filters
const filters = reactive({
  status: '' as Status | '',
  priority: '' as Priority | ''
})

watch(filters, (newFilters) => {
  taskStore.$patch({
    taskFilters: {
      status: newFilters.status || null,
      priority: newFilters.priority || null
    }
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
    completed: 'green',
    canceled: 'red'  // Add color for canceled tasks
  }
  return statusColors[status]
}

const getStatusIcon = (status: string): string => {
  const statusIcons: Record<string, string> = {
    not_started: 'i-heroicons-clock',
    in_progress: 'i-heroicons-arrow-path',
    in_review: 'i-heroicons-eye',
    completed: 'i-heroicons-check-circle',
    canceled: 'i-heroicons-x-circle'
  }
  return statusIcons[status] || ''
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