<!-- components/task/TaskInteractions.vue -->
<template>
 <div>
  <div class="flex justify-between items-center p-4">
   <div class="flex space-x-4">
    <UTooltip :text="isLiked ? 'Unlike' : 'Like'" class="inline-block">
     <UButton variant="ghost" :icon="isLiked ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'"
      :color="isLiked ? 'red' : 'gray'" @click="handleLike" :loading="isLoading">
      {{ likes }}
     </UButton>
    </UTooltip>

    <UTooltip text="Comments" class="inline-block">
     <UButton variant="ghost" icon="i-heroicons-chat-bubble-left" @click="toggleComments">
      {{ comments }}
     </UButton>
    </UTooltip>
   </div>

   <div class="flex items-center space-x-2">
    <UAvatar :src="assignee.avatar" size="sm" />
    <span class="text-sm text-gray-600">{{ assignee.name }}</span>
   </div>
  </div>

  <!-- Comments Modal -->
  <UModal v-model="showComments">
   <UCard :ui="{ base: 'w-full max-w-2xl' }">
    <template #header>
     <div class="flex justify-between items-center">
      <h3 class="text-lg font-medium">Comments</h3>
      <UButton icon="i-heroicons-x-mark" color="gray" variant="ghost" @click="showComments = false" />
     </div>
    </template>

    <div class="space-y-4 max-h-96 overflow-y-auto">
     <div v-for="comment in taskComments" :key="comment.id" class="flex gap-3 p-2 rounded-lg hover:bg-gray-50">
      <UAvatar :src="comment.author.avatar" size="sm" />
      <div class="flex-1">
       <div class="flex items-center gap-2">
        <span class="font-medium">{{ comment.author.name }}</span>
        <span class="text-xs text-gray-500">
         {{ formatDate(comment.createdAt) }}
        </span>
       </div>
       <p class="text-sm text-gray-600 mt-1">{{ comment.content }}</p>
      </div>
     </div>

     <div v-if="taskComments.length === 0" class="text-center py-4 text-gray-500">
      No comments yet. Be the first to comment!
     </div>
    </div>

    <template #footer>
     <form @submit.prevent="submitComment" class="flex gap-2">
      <UTextarea v-model="newComment" placeholder="Write a comment..." :ui="{ base: 'flex-1' }" :rows="2" autofocus />
      <UButton type="submit" color="primary" icon="i-heroicons-paper-airplane" :loading="isSubmitting"
       :disabled="!newComment.trim()" />
     </form>
    </template>
   </UCard>
  </UModal>
 </div>
</template>

<script setup lang="ts">
import { useTaskStore } from '~/stores/useTaskStore'

const props = defineProps<{
  taskId: number
  likes: number
  comments: number
  assignee: {
    name: string
    avatar: string
  }
}>()

// Store and state management
const taskStore = useTaskStore()
const currentUser = ref({
  id: 'user1',
  name: 'Current User',
  avatar: '/placeholder-avatar.png'
})

// Get task information
const task = computed(() => taskStore.getTaskById(props.taskId))
const taskType = computed(() => task.value?.type ?? 'unknown')

// Computed properties
const isLiked = computed(() => {
  const task = taskStore.getTaskById(props.taskId)
  return task?.likedBy?.includes(currentUser.value.id) ?? false
})

const taskComments = computed(() => 
  taskStore.getCommentsByTaskId(props.taskId)
)

// UI state
const showComments = ref(false)
const newComment = ref('')
const isLoading = ref(false)
const isSubmitting = ref(false)

// Methods
const handleLike = async () => {
  if (isLoading.value) return
  
  isLoading.value = true
  try {
    await taskStore.toggleLike(props.taskId, currentUser.value.id)
  } finally {
    isLoading.value = false
  }
}

const toggleComments = () => {
  showComments.value = true
}

const submitComment = async () => {
  if (!newComment.value.trim() || isSubmitting.value) return

  isSubmitting.value = true
  try {
    await taskStore.addComment(
      props.taskId,
      newComment.value,
      {
        name: currentUser.value.name,
        avatar: currentUser.value.avatar
      }
    )
    newComment.value = ''
    
    const toast = useToast()
    toast.add({
      title: 'Success',
      description: 'Your comment has been posted successfully',
      color: 'green'
    })
  } catch (error) {
    const toast = useToast()
    toast.add({
      title: 'Error',
      description: 'Unable to post your comment. Please try again.',
      color: 'red'
    })
  } finally {
    isSubmitting.value = false
  }
}

// Utilities
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>