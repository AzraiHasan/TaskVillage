<!-- components/task/TaskAssignment.vue -->
<template>
  <div>
    <UPopover :popper="{ placement: 'bottom-end' }">
      <!-- Trigger -->
      <UButton variant="ghost" color="gray" class="flex items-center gap-2">
        <UAvatar :src="assignee.avatar" size="xs" />
        <span class="text-sm truncate max-w-32">{{ assignee.name }}</span>
        <Icon name="heroicons:chevron-down" class="w-4 h-4" />
      </UButton>

      <!-- Popper Content -->
      <template #panel="{ close }">
        <div class="w-72 p-4">
          <h3 class="font-medium text-sm mb-2">Assign Task</h3>

          <div class="mb-3">
            <UInput v-model="searchQuery" placeholder="Search users..." icon="i-heroicons-magnifying-glass"
              class="mb-2" />
          </div>

          <div class="max-h-48 overflow-y-auto">
            <UButton v-for="user in filteredUsers" :key="user.id" block variant="ghost" color="gray"
              class="mb-1 justify-start" @click="assignToUser(user, close)">
              <div class="flex items-center gap-2">
                <UAvatar :src="user.avatar" size="sm" />
                <div class="text-left">
                  <div class="font-medium">{{ user.name }}</div>
                  <div class="text-xs text-gray-500">{{ user.role }}</div>
                </div>
              </div>
            </UButton>
          </div>
        </div>
      </template>
    </UPopover>

    <!-- Confirmation Modal for Reassignment -->
    <UModal v-model="showConfirmation">
      <UCard>
        <template #header>
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium">Reassign Task</h3>
          </div>
        </template>

        <p class="mb-4">
          Are you sure you want to reassign this task from <span class="font-medium">{{ assignee.name }}</span> to <span
            class="font-medium">{{ selectedUser?.name }}</span>?
        </p>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton color="gray" variant="ghost" @click="cancelAssignment">
              Cancel
            </UButton>
            <UButton color="primary" @click="confirmAssignment">
              Reassign
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup>
import { useTaskStore } from '~/stores/useTaskStore'

const props = defineProps({
  taskId: {
    type: Number,
    required: true
  },
  assignee: {
    type: Object,
    required: true
  }
})

const taskStore = useTaskStore()
const toast = useToast()
const searchQuery = ref('')
const showConfirmation = ref(false)
const selectedUser = ref(null)
const closePopperFn = ref(null)

// Sample team members to assign tasks to
// In a real app, this would come from a user store or API
const teamMembers = [
  {
    id: 'user1',
    name: 'Sarah Chen',
    role: 'UI Designer',
    avatar: '/placeholder-avatar.png'
  },
  {
    id: 'user2',
    name: 'Alex Johnson',
    role: 'Frontend Developer',
    avatar: '/placeholder-avatar.png'
  },
  {
    id: 'user3',
    name: 'Miguel Rodriguez',
    role: 'Project Manager',
    avatar: '/placeholder-avatar.png'
  },
  {
    id: 'user4',
    name: 'Layla Kim',
    role: 'Backend Developer',
    avatar: '/placeholder-avatar.png'
  }
]

// Filter users based on search query
const filteredUsers = computed(() => {
  if (!searchQuery.value) return teamMembers

  const query = searchQuery.value.toLowerCase()
  return teamMembers.filter(user =>
    user.name.toLowerCase().includes(query) ||
    user.role.toLowerCase().includes(query)
  )
})

// Initiate assignment to a user
const assignToUser = (user, close) => {
  // Store the close function for later use
  closePopperFn.value = close

  // If assigning to current assignee, just close
  if (user.name === props.assignee.name) {
    close()
    return
  }

  // Store selected user and show confirmation
  selectedUser.value = user
  showConfirmation.value = true
}

// Cancel the assignment process
const cancelAssignment = () => {
  showConfirmation.value = false
  selectedUser.value = null

  // Close the popper if it's still open
  if (closePopperFn.value) {
    closePopperFn.value()
    closePopperFn.value = null
  }
}

// Confirm and execute the assignment
const confirmAssignment = async () => {
  if (!selectedUser.value) return

  try {
    // Call the task store to assign the task
    await taskStore.assignTask(props.taskId, selectedUser.value)

    // Show success message
    toast.add({
      title: 'Task Assigned',
      description: `Task assigned to ${selectedUser.value.name}`,
      color: 'green'
    })
  } catch (error) {
    // Show error message
    toast.add({
      title: 'Error',
      description: 'Failed to assign task. Please try again.',
      color: 'red'
    })
  } finally {
    // Clean up
    showConfirmation.value = false
    selectedUser.value = null

    // Close the popper if it's still open
    if (closePopperFn.value) {
      closePopperFn.value()
      closePopperFn.value = null
    }
  }
}
</script>