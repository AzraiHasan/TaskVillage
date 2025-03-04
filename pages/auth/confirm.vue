<template>
 <div class="flex min-h-screen items-center justify-center">
  <div class="w-full max-w-md space-y-8 p-8 bg-white rounded-lg shadow">
   <div class="text-center">
    <h1 class="text-2xl font-bold">Email Confirmation</h1>
    <p class="mt-2 text-gray-600">
     We've sent a confirmation link to <strong>{{ email }}</strong>
    </p>
    <p class="mt-4 text-sm text-gray-500">
     Please check your email and click on the confirmation link to activate your account.
     You can close this page.
    </p>
   </div>

   <div class="mt-8 text-center">
    <UButton to="/auth/login" variant="outline">
     Return to Login
    </UButton>
   </div>
  </div>
 </div>
</template>

<script setup lang="ts">
import { useRoute } from '#app'

const route = useRoute()
const email = ref(route.query.email || '')
</script>
