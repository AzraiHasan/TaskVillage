<!-- pages/dashboard -->

<!-- pages/dashboard.vue -->
<template>
  <UContainer>
    <div class="min-h-screen">
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

      <div class="grid grid-cols-12 gap-6 mt-6">
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
// State management for the task form
const isTaskFormOpen = ref(false)

const openTaskForm = () => {
  isTaskFormOpen.value = true
}

// Rest of your existing code for navigation items, tabs, etc.
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
</script>