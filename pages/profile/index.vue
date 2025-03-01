<!-- pages/profile/index.vue -->
<template>
  <UContainer>
    <div class="py-8">
      <UBreadcrumb :items="breadcrumbItems" class="mb-6" />
      <UserProfile />
    </div>
  </UContainer>
</template>

<script setup>
import UserProfile from '~/components/user/UserProfile.vue'

// Set auth middleware to protect this page
definePageMeta({
  middleware: ['auth']
})

// Breadcrumb configuration
const breadcrumbItems = [
  {
    label: 'Dashboard',
    to: '/dashboard'
  },
  {
    label: 'Profile',
    to: '/profile'
  }
]
</script>