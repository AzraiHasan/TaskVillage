<!-- components/task/TaskForm.vue -->
<template>
  <UModal :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <UCard class="w-full max-w-xl">
      <template #header>
        <h3 class="text-lg font-medium">Create New Task</h3>
      </template>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <UFormGroup label="Title" name="title">
          <UInput v-model="form.title" placeholder="Enter task title" :ui="{ base: 'w-full' }" />
        </UFormGroup>

        <UFormGroup label="Description" name="description">
          <UTextarea v-model="form.description" placeholder="Describe your task..." :rows="3" />
        </UFormGroup>

        <div class="grid grid-cols-2 gap-4">
          <UFormGroup label="Type" name="type">
            <USelect v-model="form.type" :options="taskTypeOptions" />
          </UFormGroup>

          <UFormGroup label="Priority" name="priority">
            <USelect v-model="form.priority" :options="priorityOptions" />
          </UFormGroup>
        </div>

        <div class="flex justify-end gap-2">
          <UButton color="gray" variant="ghost" @click="$emit('update:modelValue', false)">
            Cancel
          </UButton>
          <UButton type="submit" color="primary" :loading="isSubmitting">
            Create Task
          </UButton>
        </div>
      </form>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import { useTaskStore } from '~/stores/useTaskStore'

// Define our task types and priorities as const arrays to ensure type safety
const TASK_TYPES = ['public', 'private'] as const
const PRIORITIES = ['low', 'medium', 'high'] as const

// Create type aliases from our const arrays
type TaskType = typeof TASK_TYPES[number]
type Priority = typeof PRIORITIES[number]

// Define our form interface to ensure type safety
interface TaskForm {
  title: string
  description: string
  type: TaskType
  priority: Priority
}

// Create our select options with proper typing
const taskTypeOptions = TASK_TYPES.map(type => ({
  label: type.charAt(0).toUpperCase() + type.slice(1),
  value: type
}))

const priorityOptions = PRIORITIES.map(priority => ({
  label: priority.charAt(0).toUpperCase() + priority.slice(1),
  value: priority
}))

// Props and emits for modal control
const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// Initialize task store
const taskStore = useTaskStore()

// Form state with proper typing
const form = ref<TaskForm>({
  title: '',
  description: '',
  type: 'public',
  priority: 'medium'
})

const isSubmitting = ref(false)

// Type guard to ensure type is valid
function isValidTaskType(type: string): type is TaskType {
  return TASK_TYPES.includes(type as TaskType)
}

// Type guard to ensure priority is valid
function isValidPriority(priority: string): priority is Priority {
  return PRIORITIES.includes(priority as Priority)
}

// Form handling
const handleSubmit = async () => {
  if (!form.value.title.trim()) return
  
  // Validate type and priority
  if (!isValidTaskType(form.value.type) || !isValidPriority(form.value.priority)) {
    const toast = useToast()
    toast.add({
      title: 'Invalid Input',
      description: 'Task type or priority is invalid',
      color: 'red'
    })
    return
  }

  isSubmitting.value = true
  const toast = useToast()

  try {
    // Create new task using the store with proper typing
    const newTask = {
      title: form.value.title,
      description: form.value.description,
      type: form.value.type, // TypeScript now knows this is "public" | "private"
      priority: form.value.priority, // TypeScript now knows this is "low" | "medium" | "high"
      assignee: {
        name: 'Current User',
        avatar: '/placeholder-avatar.png'
      },
      likes: 0,
      likedBy: [],
      comments: 0
    }
    
    await taskStore.createTask(newTask)

    toast.add({
      title: 'Task Created',
      description: 'Your task has been successfully created',
      color: 'green'
    })

    // Close modal and reset form
    emit('update:modelValue', false)
    form.value = {
      title: '',
      description: '',
      type: 'public',
      priority: 'medium'
    }
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to create task. Please try again.',
      color: 'red'
    })
    console.error('Error creating task:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>