<!-- pages/register.vue -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="text-center">
          <h1 class="text-2xl font-bold">Task Village</h1>
          <p class="text-gray-500 mt-1">Create your account</p>
        </div>
      </template>

      <UForm :state="form" @submit="onSubmit">
        <UFormGroup label="Name" name="name" required :error="errors.name">
          <UInput v-model="form.name" placeholder="Your name" type="text" autocomplete="name" :ui="{ size: 'lg' }"
            :disabled="isLoading" />
        </UFormGroup>

        <UFormGroup label="Email" name="email" required :error="errors.email">
          <UInput v-model="form.email" placeholder="your@email.com" type="email" autocomplete="email"
            :ui="{ size: 'lg' }" :disabled="isLoading" />
        </UFormGroup>

        <UFormGroup label="Password" name="password" required :error="errors.password">
          <UInput v-model="form.password" placeholder="Create a password" type="password" autocomplete="new-password"
            :ui="{ size: 'lg' }" :disabled="isLoading" />
        </UFormGroup>

        <UFormGroup label="Confirm Password" name="passwordConfirmation" required :error="errors.passwordConfirmation">
          <UInput v-model="form.passwordConfirmation" placeholder="Confirm your password" type="password"
            autocomplete="new-password" :ui="{ size: 'lg' }" :disabled="isLoading" />
        </UFormGroup>

        <div class="pt-4">
          <UButton type="submit" color="primary" block :loading="isLoading" :disabled="isLoading">
            Create Account
          </UButton>
        </div>
      </UForm>

      <!-- Error Alert -->
      <UAlert v-if="error" class="mt-4" color="red" variant="soft" icon="i-heroicons-exclamation-circle"
        :title="error" />

      <template #footer>
        <div class="text-center">
          <p class="text-sm text-gray-500">
            Already have an account?
            <NuxtLink to="/login" class="text-primary-600 hover:underline">Sign in</NuxtLink>
          </p>
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup>
import { z } from 'zod'

const router = useRouter()
const toast = useToast()
const { loggedIn } = useUserSession()

// Redirect if already logged in
onMounted(() => {
  if (loggedIn.value) {
    router.push('/dashboard')
  }
})

// Form state
const form = reactive({
  name: '',
  email: '',
  password: '',
  passwordConfirmation: '',
  csrfToken: '' // Added field for CSRF token
})

const isLoading = ref(false)
const error = ref('')
const errors = reactive({
  name: '',
  email: '',
  password: '',
  passwordConfirmation: ''
})

// Fetch CSRF token when component mounts
onMounted(async () => {
  if (loggedIn.value) {
    router.push('/dashboard')
    return
  }

  try {
    // Get CSRF token from the server
    const { token } = await $fetch('/api/csrf')
    form.csrfToken = token
  } catch (err) {
    console.error('Failed to fetch CSRF token:', err)
    error.value = 'Failed to initialize security features. Please refresh the page.'
  }
})

// Client-side validation schema using zod
const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  passwordConfirmation: z.string()
}).refine(data => data.password === data.passwordConfirmation, {
  message: "Passwords don't match",
  path: ['passwordConfirmation']
})

const onSubmit = async () => {
  // Reset errors
  error.value = ''
  Object.keys(errors).forEach(key => errors[key] = '')

  try {
    // Validate form data
    schema.parse(form)

    isLoading.value = true

    // Call register API endpoint with CSRF token
    await $fetch('/api/register', {
      method: 'POST',
      body: {
        name: form.name,
        email: form.email,
        password: form.password,
        csrfToken: form.csrfToken
      }
    })

    // Refresh session data on client
    const { fetch: refreshSession } = useUserSession()
    await refreshSession()

    // Show success message
    toast.add({
      title: 'Success!',
      description: 'Your account has been created and you are now logged in',
      color: 'green'
    })

    // Redirect to dashboard
    router.push('/dashboard')
  } catch (err) {
    if (err.statusCode === 403) {
      error.value = 'Security validation failed. Please refresh the page and try again.'
    } else if (err instanceof z.ZodError) {
      // Handle validation errors
      err.errors.forEach(e => {
        if (e.path.length > 0) {
          errors[e.path[0]] = e.message
        }
      })
    } else if (err.data?.statusCode === 409) {
      // Handle duplicate email
      errors.email = 'This email is already registered'
    } else {
      // Handle other errors
      error.value = err.data?.message || 'Something went wrong. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>