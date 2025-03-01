<!-- pages/profile/edit.vue -->
<template>
 <UContainer>
  <div class="max-w-2xl mx-auto py-8">
   <UCard>
    <template #header>
     <div class="flex justify-between items-center">
      <h1 class="text-xl font-bold">Edit Profile</h1>
      <UButton variant="ghost" icon="i-heroicons-arrow-left" to="/dashboard">
       Back
      </UButton>
     </div>
    </template>

    <UForm :state="form" @submit="onSubmit">
     <div class="space-y-6">
      <!-- Profile Avatar -->
      <div class="flex flex-col items-center gap-4">
       <UAvatar :src="form.avatar || '/placeholder-avatar.png'" size="2xl" />
       <UButton variant="soft" size="sm" disabled>
        Change Avatar
        <template #trailing>
         <Icon name="heroicons:camera" />
        </template>
       </UButton>
       <p class="text-xs text-gray-500">(Avatar upload coming soon)</p>
      </div>

      <!-- Profile Fields -->
      <UFormGroup label="Name" name="name" required :error="errors.name">
       <UInput v-model="form.name" placeholder="Your name" />
      </UFormGroup>

      <UFormGroup label="Email" name="email" required :error="errors.email">
       <UInput v-model="form.email" placeholder="Your email" type="email" />
      </UFormGroup>

      <UFormGroup label="Role" name="role">
       <UInput v-model="form.role" placeholder="Your role" disabled />
       <template #description>
        <span class="text-xs text-gray-500">Role cannot be changed</span>
       </template>
      </UFormGroup>

      <!-- Workspaces -->
      <div>
       <h3 class="text-sm font-medium mb-2">Workspaces</h3>
       <div class="space-y-2">
        <div v-for="workspace in workspaces" :key="workspace.id" class="flex items-center gap-2">
         <UCheckbox v-model="form.workspaces" :value="workspace.id" disabled />
         <span>{{ workspace.name }}</span>
        </div>
       </div>
       <p class="text-xs text-gray-500 mt-1">Workspace assignments are managed by administrators</p>
      </div>
     </div>

     <div class="flex justify-end gap-2 mt-6">
      <UButton to="/dashboard" variant="ghost">
       Cancel
      </UButton>
      <UButton type="submit" color="primary" :loading="isSubmitting" :disabled="isSubmitting">
       Save Changes
      </UButton>
     </div>
    </UForm>

    <!-- Error Alert -->
    <UAlert v-if="error" class="mt-4" color="red" variant="soft" icon="i-heroicons-exclamation-circle" :title="error" />
   </UCard>
  </div>
 </UContainer>
</template>

<script setup>
import { z } from 'zod'
import { useUserSession } from '#imports'

// Get user data from session
const { session, fetch: refreshSession } = useUserSession()
const toast = useToast()
const router = useRouter()

// Mock workspaces data
const workspaces = [
 { id: 1, name: 'Marketing Team' },
 { id: 2, name: 'Development Team' }
]

// Ensure we're logged in
definePageMeta({
 middleware: ['auth']
})

// Form state initialization
const form = reactive({
 name: '',
 email: '',
 avatar: '',
 role: '',
 workspaces: []
})

const errors = reactive({
 name: '',
 email: ''
})

const isSubmitting = ref(false)
const error = ref('')

// Form validation schema
const schema = z.object({
 name: z.string().min(2, 'Name must be at least 2 characters'),
 email: z.string().email('Please enter a valid email address')
})

// Initialize form with current user data
onMounted(() => {
 if (session.value?.user) {
  const user = session.value.user
  form.name = user.name || ''
  form.email = user.email || ''
  form.avatar = user.avatar || ''
  form.role = user.roles ? user.roles[0] : 'User'
  form.workspaces = user.workspaces || []
 }
})

// Form submission handler
const onSubmit = async () => {
 // Reset errors
 error.value = ''
 errors.name = ''
 errors.email = ''

 try {
  // Validate form data
  schema.parse(form)

  isSubmitting.value = true

  // Call the update profile API endpoint
  await $fetch('/api/user/profile', {
   method: 'PUT',
   body: {
    name: form.name,
    email: form.email
   }
  })

  // Refresh session data to get updated user info
  await refreshSession()

  // Show success message
  toast.add({
   title: 'Success!',
   description: 'Your profile has been updated',
   color: 'green'
  })

  // Redirect back to dashboard
  router.push('/dashboard')
 } catch (err) {
  if (err instanceof z.ZodError) {
   // Handle validation errors
   err.errors.forEach(e => {
    if (e.path.length > 0) {
     errors[e.path[0]] = e.message
    }
   })
  } else {
   // Handle server errors
   error.value = err.data?.message || 'Something went wrong. Please try again.'
  }
 } finally {
  isSubmitting.value = false
 }
}
</script>