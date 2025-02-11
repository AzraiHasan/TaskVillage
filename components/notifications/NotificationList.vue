<!-- components/notifications/NotificationList -->

<template>
 <UCard>
  <template #header>
   <div class="flex justify-between items-center">
    <h3 class="font-medium">Notifications</h3>
    <UButton variant="ghost" icon="i-heroicons-check-circle" @click="markAllRead" />
   </div>
  </template>

  <div class="space-y-2">
   <div v-for="notification in notifications" :key="notification.id"
    class="flex items-start gap-3 p-2 rounded hover:bg-gray-50" :class="{ 'bg-blue-50': !notification.read }">
    <UAvatar :src="notification.user.avatar" size="sm" />
    <div>
     <p class="text-sm">
      <span class="font-medium">{{ notification.user.name }}</span>
      {{ notification.action }}
     </p>
     <span class="text-xs text-gray-500">{{ notification.time }}</span>
    </div>
   </div>
  </div>
 </UCard>
</template>

<script setup>
const notifications = ref([
 {
  id: 1,
  user: { name: 'Mike Johnson', avatar: '/avatar1.jpg' },
  action: 'commented on your task',
  time: '5m ago',
  read: false
 }
])

const markAllRead = () => { /* TODO */ }
</script>