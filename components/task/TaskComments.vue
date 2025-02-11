<!-- components/task/TaskComments -->

<template>
  <UCard>
    <template #header>
      <h3 class="font-medium">Comments ({{ comments.length }})</h3>
    </template>

    <div class="space-y-4">
      <div v-for="comment in comments" :key="comment.id" class="flex gap-3">
        <UAvatar :src="comment.author.avatar" size="sm" />
        <div>
          <div class="flex items-center gap-2">
            <span class="font-medium">{{ comment.author.name }}</span>
            <span class="text-xs text-gray-500">{{ comment.createdAt }}</span>
          </div>
          <p class="text-sm text-gray-600">{{ comment.content }}</p>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex gap-2">
        <UTextarea v-model="newComment" placeholder="Add a comment..." rows="2" />
        <UButton color="primary" icon="i-heroicons-paper-airplane" @click="submitComment" />
      </div>
    </template>
  </UCard>
</template>

<script setup>
const props = defineProps({
  taskId: { type: Number, required: true }
})

const comments = ref([
  {
    id: 1,
    content: "Great progress!",
    author: { name: "Sarah Chen", avatar: "/avatar1.jpg" },
    createdAt: "2h ago"
  }
])

const newComment = ref('')
const submitComment = () => { /* TODO */ }
</script>