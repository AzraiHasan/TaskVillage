<!-- components/analytics/TaskCompletionStats.vue -->
<template>
 <UCard>
  <template #header>
   <h3 class="font-medium">Task Completion Rate</h3>
  </template>

  <div class="grid grid-cols-3 gap-4">
   <!-- Completion Rate Card -->
   <div class="text-center p-4">
    <div class="text-3xl font-bold text-green-600">{{ completionRate }}%</div>
    <div class="text-sm text-gray-500">Completion Rate</div>
   </div>

   <!-- Tasks Completed Card -->
   <div class="text-center p-4">
    <div class="text-3xl font-bold text-blue-600">{{ completedTasksCount }}</div>
    <div class="text-sm text-gray-500">Completed Tasks</div>
   </div>

   <!-- Total Tasks Card -->
   <div class="text-center p-4">
    <div class="text-3xl font-bold">{{ totalTasksCount }}</div>
    <div class="text-sm text-gray-500">Total Tasks</div>
   </div>
  </div>

  <!-- Visual Progress Bar -->
  <div class="mt-4">
   <div class="flex justify-between text-sm mb-1">
    <span>Progress</span>
    <span>{{ completedTasksCount }}/{{ totalTasksCount }}</span>
   </div>
   <UProgress :value="completionRate" color="green" />
  </div>
 </UCard>
</template>

<script setup>
import { useTaskStore } from '~/stores/useTaskStore'

const props = defineProps({
 workspaceId: {
  type: Number,
  default: null
 }
})

const taskStore = useTaskStore()

// Computed values for task statistics
const totalTasksCount = computed(() => {
 return props.workspaceId
  ? taskStore.tasks.filter(task => task.workspaceId === props.workspaceId).length
  : taskStore.tasks.length
})

const completedTasksCount = computed(() => {
 const tasks = props.workspaceId
  ? taskStore.tasks.filter(task => task.workspaceId === props.workspaceId)
  : taskStore.tasks

 return tasks.filter(task => task.status === 'completed').length
})

const completionRate = computed(() => {
 if (totalTasksCount.value === 0) return 0
 return Math.round((completedTasksCount.value / totalTasksCount.value) * 100)
})
</script>