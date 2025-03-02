<!-- pages/profile/edit.vue (fixed script setup tag) -->
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
              <UAvatar :src="avatarPreview || form.avatar || '/placeholder-avatar.png'" size="2xl" />
              <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleAvatarChange" />
              <UButton variant="soft" size="sm" @click="triggerFileInput">
                Change Avatar
                <template #trailing>
                  <Icon name="heroicons:camera" />
                </template>
              </UButton>
              <p v-if="avatarError" class="text-xs text-red-500">{{ avatarError }}</p>
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

            <!-- Workspaces with Permission Roles -->
            <div>
              <h3 class="text-sm font-medium mb-2">Workspace Permissions</h3>
              <div class="space-y-2">
                <div v-for="workspace in workspaces" :key="workspace.id"
                  class="flex items-center justify-between p-2 border rounded-md">
                  <div class="flex items-center gap-2">
                    <UIcon name="i-heroicons-building-office-2" class="text-gray-500" />
                    <span>{{ workspace.name }}</span>
                  </div>
                  <UBadge :color="getRoleBadgeColor(getUserRoleInWorkspace(workspace.id))">
                    {{ getUserRoleInWorkspace(workspace.id) }}
                  </UBadge>
                </div>
              </div>
              <p class="text-xs text-gray-500 mt-1">Workspace permissions are managed by administrators</p>
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
        <UAlert v-if="error" class="mt-4" color="red" variant="soft" icon="i-heroicons-exclamation-circle"
          :title="error" />
      </UCard>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { useUserSession, useToast, useRouter, ref, reactive, onMounted } from '#imports'
import { useUser } from '~/composables/useUser'

// Define the WorkspaceRole type within this file (since we can't import it as a type)
type WorkspaceRole = 'owner' | 'admin' | 'member' | 'guest'

// Type guard for the new permission structure
function hasWorkspacePermissions(user: any): user is { workspacePermissions: Array<{ workspaceId: number, role: WorkspaceRole }> } {
  return user && Array.isArray(user.workspacePermissions)
}

// Get user data from session
const { session, fetch: refreshSession } = useUserSession()
const toast = useToast()
const router = useRouter()
const fileInput = ref(null)
const avatarPreview = ref(null)
const avatarFile = ref(null)
const avatarError = ref(null)

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
 workspacePermissions: []
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

// Get the user's role in a specific workspace
const getUserRoleInWorkspace = (workspaceId: number): WorkspaceRole => {
  if (!session.value?.user) return 'guest'
  
  const user = session.value.user
  
  // Check if user has the new permissions structure
  if (hasWorkspacePermissions(user)) {
    const permission = user.workspacePermissions.find(wp => wp.workspaceId === workspaceId)
    return permission?.role || 'guest'
  }
  
  // Fall back to the old workspaces array structure
  if (Array.isArray(user.workspaces) && user.workspaces.includes(workspaceId)) {
    return 'member'
  }
  
  return 'guest'
}

// Get badge color based on role
const getRoleBadgeColor = (role) => {
  switch(role) {
    case 'owner':
      return 'green'
    case 'admin':
      return 'blue'
    case 'member':
      return 'purple'
    case 'guest':
      return 'gray'
    default:
      return 'gray'
  }
}

// Initialize form with current user data
onMounted(() => {
 if (session.value?.user) {
  const user = session.value.user
  form.name = user.name || ''
  form.email = user.email || ''
  form.avatar = user.avatar || ''
  form.role = user.roles ? user.roles[0] : 'User'
  form.workspacePermissions = user.workspacePermissions || []
 }
})

// Trigger file input click
const triggerFileInput = () => {
 fileInput.value.click()
}

// Handle avatar file selection
const handleAvatarChange = (event) => {
 const file = event.target.files[0]
 avatarError.value = null

 if (!file) return

 // Validate file type
 if (!file.type.startsWith('image/')) {
  avatarError.value = 'Please select an image file'
  return
 }

 // Validate file size (max 5MB)
 if (file.size > 5 * 1024 * 1024) {
  avatarError.value = 'Image size should not exceed 5MB'
  return
 }

 // Store file for upload
 avatarFile.value = file

 // Create preview
 const reader = new FileReader()
 reader.onload = (e) => {
  avatarPreview.value = e.target.result
 }
 reader.readAsDataURL(file)
}

// Upload avatar function
const uploadAvatar = async () => {
 if (!avatarFile.value) return null

 try {
  const formData = new FormData()
  formData.append('avatar', avatarFile.value)

  const response = await $fetch('/api/user/avatar', {
   method: 'POST',
   body: formData
  })

  return response.avatar
 } catch (err) {
  console.error('Avatar upload error:', err)
  throw new Error('Failed to upload avatar')
 }
}

// Form submission handler
const onSubmit = async () => {
 // Reset errors
 error.value = ''
 errors.name = ''
 errors.email = ''
 avatarError.value = null

 try {
  // Validate form data
  schema.parse(form)

  isSubmitting.value = true

  // Upload avatar if a new one is selected
  let avatarUrl = form.avatar
  if (avatarFile.value) {
   avatarUrl = await uploadAvatar()
  }

  // Call the update profile API endpoint
  await $fetch('/api/user/profile', {
   method: 'PUT',
   body: {
    name: form.name,
    email: form.email,
    avatar: avatarUrl
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
  } else if (err.message === 'Failed to upload avatar') {
   avatarError.value = 'Failed to upload avatar. Please try again.'
  } else {
   // Handle server errors
   error.value = err.data?.message || 'Something went wrong. Please try again.'
  }
 } finally {
  isSubmitting.value = false
 }
}
</script>
