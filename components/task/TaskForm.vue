<!-- components/task/TaskForm.vue -->

<script setup>
import { useTaskStore } from '~/stores/useTaskStore'

// Props and emits for modal control
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

// Initialize task store
const taskStore = useTaskStore()

// Form state with additional fields
const form = ref({
  title: '',
  description: '',
  type: 'public',
  priority: 'medium'
})

// Form handling
const handleSubmit = () => {
  // Add task using store action
  taskStore.addTask({
    ...form.value,
    assignee: {
      name: 'Current User',
      avatar: '/placeholder-avatar.png'
    }
  })

  // Show success notification
  const toast = useToast()
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
}
</script>

<template>
  <UModal :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <UCard class="w-full max-w-xl">
      <template #header>
        <h3 class="font-medium">Create New Task</h3>
      </template>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <UFormGroup label="Title" name="title">
          <UInput v-model="form.title" placeholder="Enter task title" />
        </UFormGroup>

        <UFormGroup label="Description" name="description">
          <UTextarea v-model="form.description" placeholder="Describe your task..." :rows="3" />
        </UFormGroup>

        <div class="grid grid-cols-2 gap-4">
          <UFormGroup label="Type" name="type">
            <USelect v-model="form.type" :options="[
              { label: 'Public', value: 'public' },
              { label: 'Private', value: 'private' }
            ]" />
          </UFormGroup>

          <UFormGroup label="Priority" name="priority">
            <USelect v-model="form.priority" :options="[
              { label: 'Low', value: 'low' },
              { label: 'Medium', value: 'medium' },
              { label: 'High', value: 'high' }
            ]" />
          </UFormGroup>
        </div>

        <div class="flex justify-end gap-2">
          <UButton color="gray" variant="ghost" @click="$emit('update:modelValue', false)">
            Cancel
          </UButton>
          <UButton type="submit" color="primary">
            Create Task
          </UButton>
        </div>
      </form>
    </UCard>
  </UModal>
</template>