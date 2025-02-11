<!-- components/task/TaskInteractions -->

<template>
 <div class="flex justify-between items-center p-4">
  <div class="flex space-x-4">
   <UButton variant="ghost" :icon="isLiked ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'"
    :color="isLiked ? 'red' : 'gray'" @click="toggleLike" :label="likes.toString()" />
   <UButton variant="ghost" icon="i-heroicons-chat-bubble-left" @click="openComments" :label="comments.toString()" />
  </div>
  <div class="flex items-center space-x-2">
   <UAvatar :src="assignee.avatar" size="sm" />
   <span class="text-sm text-gray-600">{{ assignee.name }}</span>
  </div>
 </div>
</template>

<script setup>
const props = defineProps({
 taskId: { type: Number, required: true },
 likes: { type: Number, default: 0 },
 comments: { type: Number, default: 0 },
 assignee: { type: Object, required: true }
})

const isLiked = ref(false)
const toggleLike = () => { /* TODO */ }
const openComments = () => { /* TODO */ }
</script>