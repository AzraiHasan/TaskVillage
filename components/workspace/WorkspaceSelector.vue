<!-- components/workspace/WorkspaceSelector.vue -->

<template>
 <UCard>
  <template #header>
   <div class="flex justify-between items-center">
    <h3 class="font-medium">Current Workspace</h3>
   </div>
  </template>

  <div class="space-y-2">
   <USelectMenu v-model="selectedWorkspace" :options="workspaces" option-attribute="name"
    @change="handleWorkspaceChange">
    <template #label>
     {{ selectedWorkspace?.name || 'Select Workspace' }}
    </template>
   </USelectMenu>
  </div>
 </UCard>
</template>

<script setup lang="ts">
import { useTaskStore } from '~/stores/useTaskStore'

// For demonstration, we'll use some sample workspaces
const workspaces = ref([
  { id: 1, name: 'Marketing Team' },
  { id: 2, name: 'Development Team' }
])

const selectedWorkspace = ref(workspaces.value[0])
const taskStore = useTaskStore()

const handleWorkspaceChange = (workspace: typeof workspaces.value[0]) => {
  selectedWorkspace.value = workspace
  taskStore.setWorkspace(workspace.id)
}
</script>