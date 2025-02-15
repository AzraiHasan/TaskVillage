<!-- components/task/TaskForm.vue -->

<template>
  <UModal :model-value="modelValue" @update:model-value="handleModalUpdate" @before-leave="handleBeforeLeave">
    <UCard class="w-full max-w-xl">
      <template #header>
        <h3 class="text-lg font-medium">Create New Task</h3>
      </template>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <UFormGroup label="Title" name="title" required>
          <UInput v-model="formData.title" placeholder="Enter task title" />
        </UFormGroup>

        <UFormGroup label="Description" name="description">
          <UTextarea v-model="formData.description" placeholder="Describe your task..." :rows="3" />
        </UFormGroup>

        <div class="grid grid-cols-2 gap-4">
          <UFormGroup label="Type" name="type" required>
            <USelect v-model="formData.type" :options="taskTypeOptions" />
          </UFormGroup>

          <UFormGroup label="Priority" name="priority" required>
            <USelect v-model="formData.priority" :options="priorityOptions" />
          </UFormGroup>

        </div>

        <UFormGroup label="Workspace" name="workspace" required>
          <USelect v-model="workspaceIdValue" :options="workspaces" option-attribute="name" value-attribute="id"
            placeholder="Select Workspace" />
        </UFormGroup>

        <UFormGroup label="Due Date" name="dueDate">
          <UPopover :popper="{ placement: 'bottom-start' }">
            <UButton icon="i-heroicons-calendar-days-20-solid"
              :label="formData.dueDate ? format(formData.dueDate, 'd MMM, yyyy') : 'Set due date'" />
            <template #panel="{ close }">
              <DatePicker v-if="isDatePickerVisible" v-model="formData.dueDate" :min="new Date()"
                @close="handleDatePickerClose(close)" />
            </template>
          </UPopover>
        </UFormGroup>

        <div class="flex justify-end gap-2">
          <UButton color="gray" variant="ghost" @click="handleCancel">
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
import { format } from 'date-fns'
import { useTaskStore } from '~/stores/useTaskStore'
import DatePicker from '~/components/ui/DatePicker.vue'
import { UFormGroup } from '#components'

// Define task types and priorities
const TASK_TYPES = ['public', 'private'] as const
const PRIORITIES = ['low', 'medium', 'high'] as const

type TaskType = typeof TASK_TYPES[number]
type Priority = typeof PRIORITIES[number]

interface TaskFormData {
  title: string
  description: string
  type: TaskType
  priority: Priority
  dueDate: Date | null
  workspaceId: number | null
}

// Props and emits
const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// Component state
const taskStore = useTaskStore()
const isSubmitting = ref(false)
const isDatePickerVisible = ref(true)

const workspaceIdValue = computed(() => formData.value.workspaceId !== null ? formData.value.workspaceId : '')

// Form data with default values
const formData = ref<TaskFormData>({
  title: '',
  description: '',
  type: 'public',
  priority: 'medium',
  dueDate: null,
  workspaceId: null
})

// Same sample workspaces for demonstration
const workspaces = ref([
  { id: 1, name: 'Marketing Team' },
  { id: 2, name: 'Development Team' }
])

// Select options
const taskTypeOptions = TASK_TYPES.map(type => ({
  label: type.charAt(0).toUpperCase() + type.slice(1),
  value: type
}))

const priorityOptions = PRIORITIES.map(priority => ({
  label: priority.charAt(0).toUpperCase() + priority.slice(1),
  value: priority
}))

// Type guards
function isValidTaskType(type: string): type is TaskType {
  return TASK_TYPES.includes(type as TaskType)
}

function isValidPriority(priority: string): priority is Priority {
  return PRIORITIES.includes(priority as Priority)
}

// Event handlers
const handleModalUpdate = (value: boolean) => {
  emit('update:modelValue', value)
}

const handleBeforeLeave = () => {
  isDatePickerVisible.value = false
}

const handleDatePickerClose = (close: () => void) => {
  close()
}

const handleCancel = () => {
  resetForm()
  emit('update:modelValue', false)
}

const resetForm = () => {
  formData.value = {
    title: '',
    description: '',
    type: 'public',
    priority: 'medium',
    dueDate: null,
    workspaceId: null
  }
  isDatePickerVisible.value = true
}

// Form submission
const handleSubmit = async () => {
   if (!formData.value.title.trim() || !formData.value.workspaceId) return
  
  if (!isValidTaskType(formData.value.type) || !isValidPriority(formData.value.priority)) {
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
    const newTask = {
      title: formData.value.title,
      description: formData.value.description,
      type: formData.value.type,
      priority: formData.value.priority,
      dueDate: formData.value.dueDate?.toISOString() || null,
      assignee: {
        name: 'Current User',
        avatar: '/placeholder-avatar.png'
      }
    }
    
    await taskStore.createTask(newTask)

    toast.add({
      title: 'Success',
      description: 'Task created successfully',
      color: 'green'
    })

    resetForm()
    emit('update:modelValue', false)
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

// Cleanup on component unmount
onBeforeUnmount(() => {
  isDatePickerVisible.value = false
})
</script>