<!-- components/task/TaskFeed.vue -->

<script setup>
import { useTaskStore } from '~/stores/useTaskStore'

const props = defineProps({
 type: {
  type: String,
  required: true,
  validator: (value) => ['public', 'private'].includes(value)
 }
})

// Initialize task store
const taskStore = useTaskStore()

// Use the appropriate getter based on type
const tasks = computed(() =>
 props.type === 'public' ? taskStore.publicTasks : taskStore.privateTasks
)
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
     <UBadge :color="task.priority === 'high' ? 'red' : 'yellow'" size="sm">
      {{ task.priority }}
     </UBadge>
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