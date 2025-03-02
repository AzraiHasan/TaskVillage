<!-- components/workspace/WorkspaceSelector.vue -->

<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="font-medium">Current Workspace</h3>
      </div>
    </template>

    <div class="space-y-2">
      <USelectMenu v-model="selectedWorkspaceValue" :options="workspacesWithRoles" option-attribute="name"
        @change="handleWorkspaceChange">
        <template #label>
          {{ selectedWorkspace?.name || 'Select Workspace' }}
        </template>
        <template #option="{ option }">
          <div class="flex justify-between items-center w-full">
            <span>{{ option.name }}</span>
            <UBadge size="xs" :color="getRoleBadgeColor(option.role)" class="ml-auto">
              {{ option.role }}
            </UBadge>
          </div>
        </template>
      </USelectMenu>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useTaskStore } from '~/stores/useTaskStore'
import { useUser, type WorkspaceRole } from '~/composables/useUser'

// Sample workspace data
interface WorkspaceOption {
  id: number
  name: string
  role: WorkspaceRole
}

// Get user permissions
const { user } = useUser()

// Create computed workspaces with user roles
const workspacesWithRoles = computed<WorkspaceOption[]>(() => {
  if (!user.value || !user.value.workspacePermissions) {
    return [
      { id: 1, name: 'Marketing Team', role: 'member' },
      { id: 2, name: 'Development Team', role: 'member' }
    ]
  }
  
  // Map user permissions to workspace options
  return user.value.workspacePermissions.map(wp => ({
    id: wp.workspaceId,
    name: wp.workspaceId === 1 ? 'Marketing Team' : 'Development Team',
    role: wp.role
  }))
})

const selectedWorkspace = ref<WorkspaceOption | undefined>(undefined)

// Create a computed property for v-model binding to handle type compatibility
const selectedWorkspaceValue = computed({
  get: () => selectedWorkspace.value || undefined,
  set: (value: WorkspaceOption | undefined) => {
    selectedWorkspace.value = value
  }
})

const taskStore = useTaskStore()

// Initialize the selected workspace on component mount
onMounted(() => {
  if (workspacesWithRoles.value.length > 0) {
    // Default to first workspace or the current one in the task store
    const currentWorkspaceId = taskStore.workspaceId
    if (currentWorkspaceId) {
      const current = workspacesWithRoles.value.find(w => w.id === currentWorkspaceId)
      if (current) {
        selectedWorkspace.value = current
      } else {
        selectedWorkspace.value = workspacesWithRoles.value[0]
      }
    } else {
      selectedWorkspace.value = workspacesWithRoles.value[0]
    }
  }
})

const handleWorkspaceChange = (workspace: WorkspaceOption) => {
  selectedWorkspace.value = workspace
  taskStore.setWorkspace(workspace.id)
}

// Get a badge color based on role
const getRoleBadgeColor = (role: WorkspaceRole) => {
  switch(role) {
    case 'owner': return 'green'
    case 'admin': return 'blue'
    case 'member': return 'purple'
    case 'guest': return 'gray'
    default: return 'gray'
  }
}
</script>