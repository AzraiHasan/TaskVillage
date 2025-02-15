<!-- pages/dashboard.vue -->
<template>
  <UContainer>
    <div class="min-h-screen">
      <!-- Header -->
      <div class="flex justify-between items-center py-4">
        <div class="flex items-center gap-4">
          <h1 class="text-xl font-bold">Task Village</h1>
          <UButton size="sm" icon="i-heroicons-plus" @click="openTaskForm">
            New Task
          </UButton>
        </div>

        <div class="flex items-center gap-4">
          <UButton variant="ghost" icon="i-heroicons-bell" :notifications="2" />
          <UAvatar src="/placeholder-avatar.png" size="sm" />
        </div>
      </div>

      <!-- Workspace Selector -->
      <div class="mt-4 mb-6">
        <WorkspaceSelector />
      </div>

      <!-- Main Content -->
      <div class="grid grid-cols-12 gap-6">
        <div class="col-span-3">
          <UCard>
            <UVerticalNavigation :items="navigationItems" />
          </UCard>
        </div>

        <div class="col-span-9">
          <UTabs :items="tabItems" @change="handleTabChange" />
          <div class="mt-4">
            <TaskFeed v-if="activeTab === 'public'" type="public" />
            <TaskFeed v-else type="private" />
          </div>
        </div>
      </div>
    </div>

    <TaskForm v-model="isTaskFormOpen" />
  </UContainer>
</template>

<script setup>
import { useTaskStore } from '~/stores/useTaskStore'

const taskStore = useTaskStore()
const isTaskFormOpen = ref(false)

const openTaskForm = () => {
  isTaskFormOpen.value = true
}

const navigationItems = [
  {
    label: 'Feed',
    icon: 'i-heroicons-home',
    to: '/dashboard'
  },
  {
    label: 'My Tasks',
    icon: 'i-heroicons-check-circle',
    to: '/tasks'
  },
  {
    label: 'Team',
    icon: 'i-heroicons-users',
    to: '/team'
  }
]

const tabItems = [
  {
    label: 'Public',
    icon: 'i-heroicons-globe-alt'
  },
  {
    label: 'Private',
    icon: 'i-heroicons-lock-closed'
  }
]

const activeTab = ref('public')

const handleTabChange = (index) => {
  activeTab.value = index === 0 ? 'public' : 'private'
}

// Set initial workspace
onMounted(() => {
  taskStore.setWorkspace(1) // Set to first workspace by default
})
</script>