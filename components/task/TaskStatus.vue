<!-- components/task/TaskStatus.vue -->
<template>
  <div class="space-y-4">
    <!-- Status Selection -->
    <UFormGroup label="Status" name="status">
      <USelect v-model="selectedStatus" :options="statusOptions" @update:model-value="handleStatusChange" :ui="{
          option: {
            base: 'relative flex items-center gap-2 px-3 py-2',
            selected: 'bg-gray-100 dark:bg-gray-800'
          }
        }">
        <template #option="{ item }">
          <div class="flex items-center gap-2">
            <div :class="getStatusIconClass(item.value)" class="w-3 h-3 rounded-full"></div>
            {{ item.label }}
          </div>
        </template>
      </USelect>
    </UFormGroup>

    <!-- Due Date Selection -->
    <UFormGroup label="Due Date" name="dueDate">
      <UPopover mode="click" :popper="{ placement: 'bottom-start' }">
        <UButton color="gray" variant="soft"
          :icon="selectedDate ? 'i-heroicons-calendar-days-solid' : 'i-heroicons-calendar-days'">
          {{ selectedDate ? formatDate(selectedDate) : 'Set due date' }}
        </UButton>

        <template #content>
          <UCalendar v-model="selectedDate" :min="new Date()" class="p-2" @update:model-value="handleDateChange" />
        </template>
      </UPopover>
    </UFormGroup>

    <!-- Progress Tracking when Status is In Progress -->
    <UFormGroup v-if="selectedStatus === 'in_progress'" label="Progress" name="progress">
      <URange v-model="progress" :min="0" :max="100" :step="5" class="w-full" />
      <div class="text-sm text-gray-500 mt-1">
        {{ progress }}% Complete
      </div>
    </UFormGroup>

    <!-- Time Tracking -->
    <div v-if="selectedStatus === 'in_progress'" class="border rounded-lg p-4 bg-gray-50">
      <div class="flex justify-between items-center mb-2">
        <span class="text-sm font-medium">Time Tracked</span>
        <UButton v-if="!isTracking" size="xs" color="primary" @click="startTracking" icon="i-heroicons-play">
          Start Timer
        </UButton>
        <UButton v-else size="xs" color="red" @click="stopTracking" icon="i-heroicons-pause">
          Stop Timer
        </UButton>
      </div>
      <div class="text-2xl font-mono">{{ formattedTime }}</div>
    </div>

    <!-- Status History -->
    <div v-if="statusHistory.length > 0" class="mt-4">
      <h4 class="text-sm font-medium mb-2">Status History</h4>
      <div class="space-y-2">
        <div v-for="(history, index) in statusHistory" :key="index"
          class="text-sm text-gray-600 flex items-center gap-2">
          <div :class="getStatusIconClass(history.status)" class="w-2 h-2 rounded-full"></div>
          <span>{{ history.status }} - {{ formatDate(history.date) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const statusOptions = [
  { label: 'Not Started', value: 'not_started' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'In Review', value: 'in_review' },
  { label: 'Completed', value: 'completed' }
]

// State management
const selectedStatus = ref('not_started')
const selectedDate = ref<Date | null>(null)
const progress = ref(0)
const isTracking = ref(false)
const trackingTime = ref(0)
const statusHistory = ref([
  { status: 'not_started', date: new Date() }
])

// Timer interval
let timerInterval: ReturnType<typeof setInterval> | null = null

// Methods
const handleStatusChange = (newStatus: string) => {
  statusHistory.value.unshift({
    status: newStatus,
    date: new Date()
  })
  
  // Reset progress when status changes to not started
  if (newStatus === 'not_started') {
    progress.value = 0
  }
  
  // Auto set progress to 100 when completed
  if (newStatus === 'completed') {
    progress.value = 100
  }
  
  // Stop tracking if status changes from in_progress
  if (newStatus !== 'in_progress' && isTracking.value) {
    stopTracking()
  }
}

const handleDateChange = (date: Date) => {
  selectedDate.value = date
}

const startTracking = () => {
  isTracking.value = true
  timerInterval = setInterval(() => {
    trackingTime.value++
  }, 1000)
}

const stopTracking = () => {
  isTracking.value = false
  if (timerInterval) {
    clearInterval(timerInterval)
  }
}

// Utility functions
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const getStatusIconClass = (status: string) => {
  const baseClasses = 'inline-block rounded-full'
  const statusClasses = {
    not_started: 'bg-gray-400',
    in_progress: 'bg-blue-400',
    in_review: 'bg-yellow-400',
    completed: 'bg-green-400'
  }
  return `${baseClasses} ${statusClasses[status as keyof typeof statusClasses]}`
}

const formattedTime = computed(() => {
  const hours = Math.floor(trackingTime.value / 3600)
  const minutes = Math.floor((trackingTime.value % 3600) / 60)
  const seconds = trackingTime.value % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

// Cleanup
onBeforeUnmount(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})

// Expose needed values
defineExpose({
  status: selectedStatus,
  dueDate: selectedDate,
  progress,
  trackingTime
})
</script>