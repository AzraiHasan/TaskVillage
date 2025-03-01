<!-- pages/login.vue -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="text-center">
          <h1 class="text-2xl font-bold">Task Village</h1>
          <p class="text-gray-500 mt-1">Sign in to your account</p>
        </div>
      </template>

      <UForm :state="form" @submit="onSubmit">
        <UFormGroup label="Email" name="email">
          <UInput v-model="form.email" placeholder="your@email.com" type="email" autocomplete="email"
            :ui="{ size: 'lg' }" :disabled="isLoading" />
        </UFormGroup>

        <UFormGroup label="Password" name="password">
          <UInput v-model="form.password" placeholder="Your password" type="password" autocomplete="current-password"
            :ui="{ size: 'lg' }" :disabled="isLoading" />
        </UFormGroup>

        <div class="pt-4">
          <UButton type="submit" color="primary" block :loading="isLoading" :disabled="isLoading">
            Sign In
          </UButton>
        </div>
      </UForm>

      <!-- Error Alert -->
      <UAlert v-if="error" class="mt-4" color="red" variant="soft" icon="i-heroicons-exclamation-circle"
        :title="error" />

      <template #footer>
        <div class="text-center">
          <div class="mb-3">
            <p class="text-sm text-gray-500">
              Don't have an account?
              <NuxtLink to="/register" class="text-primary-600 hover:underline">Sign up</NuxtLink>
            </p>
          </div>
          <div class="text-sm text-gray-500 pt-2 border-t">
            <p>Development credentials:</p>
            <p>Email: sarah@taskvillage.dev</p>
            <p>Password: password123</p>
          </div>
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup>
const { loggedIn, session, user, fetch: refreshSession } = useUserSession()
const router = useRouter()
const toast = useToast()

// Redirect if already logged in
onMounted(() => {
  if (loggedIn.value) {
    router.push('/dashboard')
  }
})

const form = reactive({
  email: '',
  password: ''
})

const isLoading = ref(false)
const error = ref('')

const onSubmit = async () => {
  error.value = ''
  isLoading.value = true

  try {
    await $fetch('/api/login', {
      method: 'POST',
      body: {
        email: form.email,
        password: form.password
      }
    })

    // Refresh session data on client
    await refreshSession()

    // Show success notification
    toast.add({
      title: 'Success!',
      description: 'You have been logged in successfully',
      color: 'green'
    })

    // Redirect to dashboard
    router.push('/dashboard')
  } catch (err) {
    error.value = err.statusMessage || 'Invalid email or password'
  } finally {
    isLoading.value = false
  }
}
</script>