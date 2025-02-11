<!-- components/user/UserProfile -->

<template>
 <div class="max-w-2xl mx-auto">
  <UCard>
   <div class="text-center">
    <UAvatar :src="user.avatar" size="2xl" class="mb-4" />
    <h2 class="text-xl font-semibold">{{ user.name }}</h2>
    <p class="text-gray-600">{{ user.role }}</p>

    <div class="flex justify-center gap-4 mt-4">
     <UButton v-if="!isCurrentUser" :variant="isFollowing ? 'outline' : 'solid'" @click="toggleFollow">
      {{ isFollowing ? 'Following' : 'Follow' }}
     </UButton>
    </div>

    <div class="grid grid-cols-3 gap-4 mt-6">
     <div>
      <div class="font-semibold">{{ user.tasksCompleted }}</div>
      <div class="text-sm text-gray-600">Tasks</div>
     </div>
     <div>
      <div class="font-semibold">{{ user.followers }}</div>
      <div class="text-sm text-gray-600">Followers</div>
     </div>
     <div>
      <div class="font-semibold">{{ user.following }}</div>
      <div class="text-sm text-gray-600">Following</div>
     </div>
    </div>
   </div>
  </UCard>

  <div class="mt-6">
   <h3 class="font-medium mb-4">Recent Activity</h3>
   <TaskFeed :userId="user.id" />
  </div>
 </div>
</template>

<script setup>
const user = ref({
 id: 1,
 name: 'Sarah Chen',
 role: 'UI Designer',
 avatar: '/avatar1.jpg',
 tasksCompleted: 45,
 followers: 128,
 following: 91
})

const isCurrentUser = ref(false)
const isFollowing = ref(false)
const toggleFollow = () => { /* TODO */ }
</script>