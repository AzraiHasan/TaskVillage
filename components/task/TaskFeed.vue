<!-- components/task/TaskFeed.vue -->
<script setup lang="ts">
import { useTaskStore } from '~/stores/useTaskStore'

type BadgeColor = 'gray' | 'red' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink'

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value: string) => ['public', 'private'].includes(value)
  }
})

// Initialize task store
const taskStore = useTaskStore()

const getStatusColor = (status: string): BadgeColor => {
  const colors: Record<string, BadgeColor> = {
    not_started: 'gray',
    in_progress: 'blue',
    in_review: 'yellow',
    completed: 'green'
  }
  return colors[status as keyof typeof colors] || 'gray'
}

const formatStatus = (status: string): string => {
  return status.split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Track loading state for each task
const deletingTasks = ref(new Set<number>())

// Use the appropriate getter based on type
const tasks = computed(() =>
  props.type === 'public' ? taskStore.publicTasks : taskStore.privateTasks
)

// Handle task deletion
const handleDeleteTask = async (taskId: number) => {
  const confirm = window.confirm('Are you sure you want to delete this task? This action cannot be undone.')
  if (!confirm) return

  deletingTasks.value.add(taskId)
  const toast = useToast()

  try {
    const result = await taskStore.deleteTask(taskId)
    if (result) {
      toast.add({
        title: 'Success',
        description: 'Task has been deleted successfully',
        color: 'green'
      })
    } else {
      throw new Error('Failed to delete task')
    }
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to delete task. Please try again.',
      color: 'red'
    })
  } finally {
    deletingTasks.value.delete(taskId)
  }
}
</script>

<template>
  <div class="space-y-4">
    <UCard v-for="task in tasks" :key="task.id">
      <template #header>
        <div class="flex justify-between items-center">
          <div>
            <h3 class="font-semibold text-lg">{{ task.title }}</h3>
            <p class="text-sm text-gray-500">Assigned to {{ task.assignee.name }}</p>
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

      <p class="text-gray-600 mb-4">{{ task.description }}</p>

      <template #footer>
        <TaskInteractions :task-id="task.id" :likes="task.likes" :comments="task.comments" :assignee="task.assignee" />
      </template>
    </UCard>

    <div v-if="tasks.length === 0" class="text-center py-8">
      <p class="text-gray-500">No tasks found</p>
    </div>
  </div>
</template>