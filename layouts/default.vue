<template>
 <div class="min-h-screen flex flex-col">
  <!-- Navigation header -->
  <header class="bg-white shadow">
   <div class="container mx-auto px-4 py-2">
    <div class="flex items-center justify-between h-16">
     <div class="flex items-center">
      <NuxtLink to="/" class="text-xl font-bold">TaskVillage</NuxtLink>
     </div>

     <div class="flex items-center space-x-4">
      <!-- Show these navigation items when user is not logged in -->
      <template v-if="!user">
       <UButton to="/auth/login" variant="ghost">
        Sign in
       </UButton>
       <UButton to="/auth/register" color="primary">
        Sign up
       </UButton>
      </template>

      <!-- Show these navigation items when user is logged in -->
      <template v-else>
       <UButton to="/dashboard" variant="ghost">
        Dashboard
       </UButton>
       <UButton to="/notifications" variant="ghost">
        Notifications
       </UButton>
       <UButton to="/analytics" variant="ghost">
        Analytics
       </UButton>

       <!-- Logout button -->
       <UButton variant="ghost" icon="i-heroicons-arrow-right-on-rectangle" @click="handleLogout" title="Logout">
        Logout
       </UButton>

       <!-- User dropdown menu -->
       <UDropdown :items="userMenuItems">
        <UAvatar v-if="userData?.name" :src="userData?.avatar || ''" :alt="userData?.name" size="sm" />
        <UButton v-else variant="ghost" icon="i-heroicons-user-circle" />
       </UDropdown>
      </template>
     </div>
    </div>
   </div>
  </header>

  <!-- Main content -->
  <main class="flex-grow">
   <slot />
  </main>

  <!-- Footer -->
  <footer class="bg-gray-100 py-4">
   <div class="container mx-auto px-4 text-center text-sm text-gray-600">
    &copy; {{ new Date().getFullYear() }} TaskVillage. All rights reserved.
   </div>
  </footer>
 </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from '#app'

const user = useSupabaseUser()
const client = useSupabaseClient()
const router = useRouter()

// Get user metadata
const userData = computed(() => {
 if (!user.value) return null
 return {
  name: user.value.user_metadata?.name || user.value.email,
  avatar: user.value.user_metadata?.avatar || '',
 }
})

// Handle logout
const handleLogout = async () => {
 await client.auth.signOut()
 router.push('/auth/login')
}

// User menu dropdown items
const userMenuItems = computed(() => [
 [
  {
   label: 'Profile',
   icon: 'i-heroicons-user',
   click: () => router.push('/profile')
  },
  {
   label: 'Settings',
   icon: 'i-heroicons-cog-6-tooth',
   click: () => router.push('/settings')
  }
 ],
 [
  {
   label: 'Logout',
   icon: 'i-heroicons-arrow-right-on-rectangle',
   click: handleLogout
  }
 ]
])
</script>
