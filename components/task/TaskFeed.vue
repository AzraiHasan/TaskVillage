<!-- components/task/TaskFeed.vue -->
<script setup lang="ts">
import { useTaskStore } from '~/stores/useTaskStore'

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value: string) => ['public', 'private'].includes(value)
  }
})

// Initialize task store
const taskStore = useTaskStore()

// Track loading state for each task
const deletingTasks = ref(new Set<number>())

// Use the appropriate getter based on type
const tasks = computed(() =>
  props.type === 'public' ? taskStore.publicTasks : taskStore.privateTasks
)

// Handle task deletion with enhanced feedback and error handling
const handleDeleteTask = async (taskId: number) => {
  console.log('Delete requested for task:', taskId)
  
  // Show confirmation dialog
  const confirm = window.confirm('Are you sure you want to delete this task? This action cannot be undone.')
  if (!confirm) {
    console.log('Delete cancelled by user')
    return
  }

  // Track loading state
  deletingTasks.value.add(taskId)
  const toast = useToast()

  try {
    console.log('Executing delete operation for task:', taskId)
    const result = await taskStore.deleteTask(taskId)
    
    if (result) {
      toast.add({
        title: 'Success',
        description: 'Task has been deleted successfully',
        color: 'green'
      })
      console.log('Task deleted successfully:', taskId)
    } else {
      throw new Error('Failed to delete task')
    }
  } catch (error) {
    console.error('Error deleting task:', error)
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
      <UBadge :color="task.priority === 'high' ? 'red' : 'yellow'" size="sm">
       {{ task.priority }}
      </UBadge>
      <!-- Delete Button with loading state -->
      <UButton color="red" variant="ghost" icon="i-heroicons-trash" size="sm" @click="handleDeleteTask(task.id)"
       :loading="deletingTasks.has(task.id)" :disabled="deletingTasks.has(task.id)" />
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