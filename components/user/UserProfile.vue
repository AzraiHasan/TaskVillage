<!-- components/user/UserProfile.vue -->
<template>
 <div class="max-w-2xl mx-auto">
  <UCard>
   <div class="text-center">
    <UAvatar :src="profileUser.avatar || '/placeholder-avatar.png'" size="2xl" class="mb-4"
     @error="handleAvatarError" />
    <h2 class="text-xl font-semibold">{{ profileUser.name }}</h2>
    <p class="text-gray-600">{{ profileUser.role || getUserRole(profileUser) }}</p>

    <div class="flex justify-center gap-4 mt-4">
     <UButton v-if="!isCurrentUser" :variant="isFollowing ? 'outline' : 'solid'" @click="toggleFollow">
      {{ isFollowing ? 'Following' : 'Follow' }}
     </UButton>
     <UButton v-if="isCurrentUser" variant="outline" to="/profile/edit">
      Edit Profile
     </UButton>
    </div>

    <div class="grid grid-cols-3 gap-4 mt-6">
     <div>
      <div class="font-semibold">{{ profileUser.tasksCompleted || '0' }}</div>
      <div class="text-sm text-gray-600">Tasks</div>
     </div>
     <div>
      <div class="font-semibold">{{ profileUser.followers || '0' }}</div>
      <div class="text-sm text-gray-600">Followers</div>
     </div>
     <div>
      <div class="font-semibold">{{ profileUser.following || '0' }}</div>
      <div class="text-sm text-gray-600">Following</div>
     </div>
    </div>
   </div>
  </UCard>

  <div class="mt-6">
   <h3 class="font-medium mb-4">Recent Activity</h3>
   <TaskFeed :userId="profileUser.id" />
  </div>
 </div>
</template>

<script setup>
import { useUserSession } from '#imports'
import { useUser } from '~/composables/useUser'

const props = defineProps({
 userId: {
  type: String,
  default: null
 }
})

// Get current user from session
const { session } = useUserSession()
const { getCurrentUser } = useUser()

// Initialize with current user data (for now)
// In a real app, we would fetch this data based on userId prop
const profileUser = computed(() => {
 // If viewing a specific user profile
 if (props.userId) {
  // Fetch that user's profile - for now, return placeholder data
  return {
   id: props.userId,
   name: 'Sarah Chen', // Placeholder
   avatar: '/placeholder-avatar.png',
   tasksCompleted: 45,
   followers: 128,
   following: 91
  }
 }

 // Default to current user
 const currentUser = getCurrentUser()
 return currentUser ? {
  ...currentUser,
  tasksCompleted: 45, // Placeholder stats
  followers: 128,
  following: 91
 } : {
  id: '',
  name: 'Guest',
  avatar: '/placeholder-avatar.png',
  tasksCompleted: 0,
  followers: 0,
  following: 0
 }
})

// Check if the profile being viewed belongs to the current user
const isCurrentUser = computed(() => {
 const currentUser = getCurrentUser()
 if (!currentUser) return false
 return currentUser.id === profileUser.value.id
})

// Format user role for display
const getUserRole = (user) => {
 if (!user || !user.roles || !user.roles.length) return 'User'
 // Return first role with capitalized first letter
 return user.roles[0].charAt(0).toUpperCase() + user.roles[0].slice(1)
}

const isFollowing = ref(false)
const toggleFollow = () => {
 // Placeholder functionality
 isFollowing.value = !isFollowing.value
 // In a full implementation, we would call an API endpoint to follow/unfollow
}
</script>