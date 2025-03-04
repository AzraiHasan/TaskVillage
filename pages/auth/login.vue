<template>
 <div class="flex min-h-screen items-center justify-center">
  <div class="w-full max-w-md space-y-8 p-8 bg-white rounded-lg shadow">
   <div class="text-center">
    <h1 class="text-2xl font-bold">Welcome to TaskVillage</h1>
    <p class="mt-2 text-gray-600">Sign in to your account</p>
   </div>

   <UForm :state="form" class="space-y-6" @submit="login">
    <UFormGroup label="Email" name="email">
     <UInput v-model="form.email" type="email" placeholder="your@email.com" />
    </UFormGroup>

    <UFormGroup label="Password" name="password">
     <UInput v-model="form.password" type="password" placeholder="********" />
    </UFormGroup>

    <div v-if="error" class="p-4 bg-red-50 text-red-500 rounded">
     {{ error }}
    </div>

    <div class="flex items-center justify-between">
     <UButton to="/auth/register" variant="link" color="gray">
      Create an account
     </UButton>
     <UButton type="submit" :loading="loading">
      Sign in
     </UButton>
    </div>
   </UForm>
  </div>
 </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

definePageMeta({
  middleware: 'guest'
})

const client = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()

const form = ref({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const login = async () => {
  error.value = ''
  loading.value = true

  try {
    const { error: authError } = await client.auth.signInWithPassword({
      email: form.value.email,
      password: form.value.password
    })

    if (authError) {
      error.value = authError.message
    } else {
      router.push('/dashboard')
    }
  } catch (e: any) {
    error.value = e.message || 'An error occurred during sign in'
  } finally {
    loading.value = false
  }
}

// If already logged in, redirect to dashboard
if (user.value) {
  router.push('/dashboard')
}
</script>
