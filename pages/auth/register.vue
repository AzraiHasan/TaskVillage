<template>
  <div class="flex min-h-screen items-center justify-center">
    <div class="w-full max-w-md space-y-8 p-8 bg-white rounded-lg shadow">
      <div class="text-center">
        <h1 class="text-2xl font-bold">Join TaskVillage</h1>
        <p class="mt-2 text-gray-600">Create your account</p>
      </div>

      <UForm :state="form" class="space-y-6" @submit="register">
        <UFormGroup label="Name" name="name">
          <UInput v-model="form.name" type="text" placeholder="Your name" />
        </UFormGroup>

        <UFormGroup label="Email" name="email">
          <UInput v-model="form.email" type="email" placeholder="your@email.com" />
        </UFormGroup>

        <UFormGroup label="Password" name="password">
          <UInput v-model="form.password" type="password" placeholder="********" autocomplete="new-password" />
        </UFormGroup>

        <div v-if="error" class="p-4 bg-red-50 text-red-500 rounded">
          {{ error }}
        </div>

        <div class="flex items-center justify-between">
          <UButton to="/auth/login" variant="link" color="gray">
            Already have an account?
          </UButton>
          <UButton type="submit" :loading="loading">
            Sign up
          </UButton>
        </div>
      </UForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from '#app'

const client = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()

const form = ref({
  name: '',
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const register = async () => {
  error.value = ''
  loading.value = true

  try {
    const { error: authError, data } = await client.auth.signUp({
      email: form.value.email,
      password: form.value.password,
      options: {
        data: {
          name: form.value.name
        }
      }
    })

    if (authError) {
      error.value = authError.message
    } else {
      // Check if email confirmation is required
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        // Email confirmation required
        router.push({
          path: '/auth/confirm',
          query: { email: form.value.email }
        })
      } else {
        // No email confirmation required
        router.push('/dashboard')
      }
    }
  } catch (e: any) {
    error.value = e.message || 'An error occurred during sign up'
  } finally {
    loading.value = false
  }
}

// If already logged in, redirect to dashboard
if (user.value) {
  router.push('/dashboard')
}
</script>
