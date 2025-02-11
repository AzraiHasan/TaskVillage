<!-- pages/dashboard -->

<template>
  <UContainer>
    <div class="min-h-screen">
      <div class="flex justify-between items-center py-4">
        <h1 class="text-xl font-bold">Task Village</h1>
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

        <div class="col-span-6">
          <UTabs :items="tabItems" @change="handleTabChange" />
          <div class="mt-4">
            <TaskFeed v-if="activeTab === 'public'" :type="'public'" />
            <TaskFeed v-else :type="'private'" />
          </div>
        </div>

        <div class="col-span-3">
          <NotificationList />
        </div>
      </div>
    </div>
  </UContainer>
</template>

<script setup>
const activeTab = ref('public')

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

const handleTabChange = (index) => {
  activeTab.value = index === 0 ? 'public' : 'private'
}
</script>