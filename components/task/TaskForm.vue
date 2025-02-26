<!-- components/task/TaskForm.vue -->
<template>
  <UModal :model-value="modelValue" @update:model-value="handleModalUpdate">
    <UCard class="w-full max-w-xl">
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-medium">{{ formTitle }}</h3>
          <p v-if="isSubmitting" class="text-sm text-gray-500">
            {{ editMode ? 'Updating' : 'Creating' }} task...
          </p>
        </div>
      </template>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <UFormGroup label="Title" name="title" required :error="validationErrors.title">
          <UInput v-model="formData.title" placeholder="Enter task title" :error="!!validationErrors.title" />
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
            <UButton icon="i-heroicons-calendar-days-20-solid" :label="formattedDueDate" />
            <template #panel="{ close }">
              <DatePicker v-if="isDatePickerVisible" v-model="formData.dueDate" :min="new Date()"
                @close="handleDatePickerClose(close)" />
            </template>
          </UPopover>
        </UFormGroup>

        <div class="flex justify-end gap-2">
          <UButton color="gray" variant="ghost" @click="handleCancel" :disabled="isSubmitting">
            Cancel
          </UButton>
          <UButton type="submit" color="primary" :loading="isSubmitting"
            :disabled="isSubmitting || hasValidationErrors">
            {{ submitButtonText }}
          </UButton>
        </div>
      </form>

      <!-- Error Alert -->
      <UAlert v-if="submitError" class="mt-4" color="red" title="Error" :description="submitError">
        <template #icon>
          <Icon name="heroicons:exclamation-circle" />
        </template>
      </UAlert>

    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import { TaskVillageError, ErrorCode } from '~/types/errors'
import { useErrorHandler } from '~/composables/useErrorHandler'
import { format, parseISO } from 'date-fns'
import { useTaskStore, TASK_TYPES, PRIORITIES } from '~/stores/useTaskStore'
import { useUser } from '~/composables/useUser'
import DatePicker from '~/components/ui/DatePicker.vue'

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



const props = defineProps<{
  modelValue: boolean
  editMode?: boolean
  taskToEdit?: Task | null
}>()

// Update title based on mode
const formTitle = computed(() => {
  return props.editMode ? 'Edit Task' : 'Create New Task'
})

// Update button text based on mode
const submitButtonText = computed(() => {
  return props.editMode ? 'Update Task' : 'Create Task'
})

onBeforeUnmount(() => {
  isDatePickerVisible.value = false
})

// Populate form when editing
onMounted(() => {
  if (props.editMode && props.taskToEdit) {
    formData.value = {
      title: props.taskToEdit.title,
      description: props.taskToEdit.description,
      type: props.taskToEdit.type,
      priority: props.taskToEdit.priority,
      dueDate: props.taskToEdit.dueDate ? new Date(props.taskToEdit.dueDate) : null,
      workspaceId: props.taskToEdit.workspaceId
    }
  }
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// Form state
const taskStore = useTaskStore()
const isSubmitting = ref(false)
const isDatePickerVisible = ref(true)
const { handleError } = useErrorHandler()
const toast = useToast()
const submitError = ref<string | null>(null)
const validationErrors = reactive({
  title: '',
  workspaceId: '',
  dueDate: ''
})

// Form validation
const validateForm = (): boolean => {
  let isValid = true
  validationErrors.title = ''
  validationErrors.workspaceId = ''
  validationErrors.dueDate = ''

  if (!formData.value.title.trim()) {
    validationErrors.title = 'Title is required'
    isValid = false
  }

  if (!formData.value.workspaceId) {
    validationErrors.workspaceId = 'Workspace is required'
    isValid = false
  }

  if (formData.value.dueDate && isNaN(new Date(formData.value.dueDate).getTime())) {
    validationErrors.dueDate = 'Invalid date format'
    isValid = false
  }

  return isValid
}

const hasValidationErrors = computed(() => {
  return Object.values(validationErrors).some(error => !!error)
})

const workspaceIdValue = computed({
  get: () => formData.value.workspaceId !== null ? formData.value.workspaceId : '',
  set: (newValue) => {
    formData.value.workspaceId = newValue !== '' ? Number(newValue) : null
  }
})

const formattedDueDate = computed(() => {
  if (!formData.value.dueDate) return 'Set due date'
  try {
    return format(formData.value.dueDate, 'd MMM, yyyy')
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Set due date'
  }
})

const formData = ref<TaskFormData>({
  title: '',
  description: '',
  type: 'public',
  priority: 'medium',
  dueDate: null,
  workspaceId: taskStore.workspaceId
})

const workspaces = ref([
  { id: 1, name: 'Marketing Team' },
  { id: 2, name: 'Development Team' }
])

const taskTypeOptions = TASK_TYPES.map(type => ({
  label: type.charAt(0).toUpperCase() + type.slice(1),
  value: type
}))

const priorityOptions = PRIORITIES.map(priority => ({
  label: priority.charAt(0).toUpperCase() + priority.slice(1),
  value: priority
}))

function isValidTaskType(type: string): type is TaskType {
  return TASK_TYPES.includes(type as TaskType)
}

function isValidPriority(priority: string): priority is Priority {
  return PRIORITIES.includes(priority as Priority)
}

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
    workspaceId: taskStore.workspaceId
  }
  isDatePickerVisible.value = true
}

// Form submission
const handleSubmit = async () => {
  submitError.value = null
  
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  try {
    if (props.editMode && props.taskToEdit) {
      // Update existing task
      await taskStore.updateTask(props.taskToEdit.id, {
        title: formData.value.title,
        description: formData.value.description,
        type: formData.value.type,
        priority: formData.value.priority,
        dueDate: formData.value.dueDate?.toISOString() || null,
        workspaceId: formData.value.workspaceId
      })

      toast.add({
        title: 'Success',
        description: 'Task updated successfully',
        color: 'green'
      })
    } else {
      // Create new task
      const newTask = await taskStore.createTask({
        title: formData.value.title,
        description: formData.value.description,
        type: formData.value.type,
        priority: formData.value.priority,
        dueDate: formData.value.dueDate?.toISOString() || null,
        workspaceId: formData.value.workspaceId,
        assignee: {
          name: 'Sarah Chen',
          avatar: '/placeholder-avatar.png'
        }
      })

      toast.add({
        title: 'Success',
        description: 'Task created successfully',
        color: 'green'
      })
    }

    resetForm()
    emit('update:modelValue', false)
  } catch (error) {
    // Error handling remains the same...
  } finally {
    isSubmitting.value = false
  }
}


</script>