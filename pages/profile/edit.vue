<!-- pages/profile/edit.vue (fixed script setup tag) -->
<template>
  <UContainer>
    <div class="max-w-2xl mx-auto py-8">
      <UCard>
        <template #header>
          <div class="flex justify-between items-center">
            <h1 class="text-xl font-bold">Edit Profile</h1>
            <UButton variant="ghost" icon="i-heroicons-arrow-left" to="/dashboard">v
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
import type { WorkspaceRole } from '~/composables/useUser'
import type { User } from '~/composables/useUser'

// Type guard for user with workspace permissions
function hasWorkspacePermissions(user: any): user is { workspacePermissions: Array<{ workspaceId: number, role: WorkspaceRole }> } {
  return user && Array.isArray(user.workspacePermissions)
}

// Typescript type for the request body
interface ProfileUpdateRequest {
  name: string
  email: string
  avatar: string | null
}

// Set auth middleware to protect this page
definePageMeta({
  middleware: ['auth']
})

// Mock workspaces data
const workspaces = [
  { id: 1, name: 'Marketing Team' },
  { id: 2, name: 'Development Team' }
]

const { session, fetch: refreshSession } = useUserSession()
const toast = useToast()
const router = useRouter()
const fileInput = ref<HTMLInputElement | null>(null)
const avatarPreview = ref<string | null>(null)
const avatarFile = ref<File | null>(null)
const avatarError = ref<string | null>(null)

// Form state initialization
const form = reactive<{
  name: string
  email: string
  avatar: string
  role: string
  workspacePermissions: Array<{ workspaceId: number, role: WorkspaceRole }>
}>({
  name: '',
  email: '',
  avatar: '',
  role: '',
  workspacePermissions: []
})

const errors = reactive<{
  name: string
  email: string
}>({
  name: '',
  email: ''
})

const isSubmitting = ref(false)
const error = ref<string | null>(null)

// Form validation schema
const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address')
})

// Get the user's role in a specific workspace
const getUserRoleInWorkspace = (workspaceId: number): WorkspaceRole => {
  if (!session.value?.user) return 'guest'
  
  const user = session.value.user as User
  
  // Check if user has the new permissions structure
  if (hasWorkspacePermissions(user)) {
    const permission = user.workspacePermissions.find(wp => wp.workspaceId === workspaceId)
    return permission?.role || 'guest'
  }
  
  return 'guest'
}

// Get badge color based on role
const getRoleBadgeColor = (role: WorkspaceRole) => {
  switch(role) {
    case 'owner': return 'green'
    case 'admin': return 'blue'
    case 'member': return 'purple'
    case 'guest': return 'gray'
    default: return 'gray'
  }
}

// Initialize form with current user data
onMounted(() => {
  if (session.value?.user) {
    const user = session.value.user as User
    form.name = user.name || ''
    form.email = user.email || ''
    form.avatar = user.avatar || ''
    form.role = user.roles ? user.roles[0] : 'User'
    form.workspacePermissions = hasWorkspacePermissions(user) 
      ? user.workspacePermissions 
      : []
  }
})

// Trigger file input click
const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

// Handle avatar file selection
const handleAvatarChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
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
    avatarPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

// Upload avatar function
const uploadAvatar = async () => {
  if (!avatarFile.value) return null

  try {
    const formData = new FormData()
    formData.append('avatar', avatarFile.value)

    const response = await $fetch<{ avatar: string }>('/api/user/avatar', {
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
  error.value = null
  errors.name = ''
  errors.email = ''
  avatarError.value = null

  try {
    // Validate form data
    schema.parse(form)

    isSubmitting.value = true

    // More explicit avatar handling
    const avatarUrl = avatarFile.value 
      ? await uploadAvatar() 
      : (form.avatar || null)

    const requestBody: ProfileUpdateRequest = {
      name: form.name,
      email: form.email,
      avatar: avatarUrl
    }

    const response = await fetch('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Optional: Add error handling for non-200 responses
    if (!response.ok) {
      throw new Error('Profile update failed')
    }

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
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      // Handle validation errors
      err.errors.forEach(e => {
        if (e.path.length > 0) {
          errors[e.path[0] as keyof typeof errors] = e.message
        }
      })
    } else if (err instanceof Error && err.message === 'Failed to upload avatar') {
      avatarError.value = 'Failed to upload avatar. Please try again.'
    } else {
      // Handle server errors
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Something went wrong. Please try again.'
      error.value = errorMessage
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>
