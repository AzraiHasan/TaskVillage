<!-- components/task/TaskFeed -->

<template>
 <div class="space-y-4">
  <UCard v-for="task in filteredTasks" :key="task.id">
   <template #header>
    <div class="flex justify-between items-center">
     <div>
      <h3 class="font-semibold text-lg">{{ task.title }}</h3>
      <p class="text-sm text-gray-500">Assigned to {{ task.assignee }}</p>
     </div>
     <UBadge :color="task.priority === 'high' ? 'red' : 'yellow'" size="sm">
      {{ task.priority }}
     </UBadge>
    </div>
   </template>

   <p class="text-gray-600 mb-4">{{ task.description }}</p>

   <template #footer>
    <TaskInteractions :likes="task.likes" :comments="task.comments" :assignee="task.assignee" />
   </template>
  </UCard>
 </div>
</template>

<script setup>
const props = defineProps({
 type: {
  type: String,
  required: true,
  validator: (value) => ['public', 'private'].includes(value)
 }
})

const tasks = ref([
 {
  id: 1,
  title: "Update landing page design",
  description: "Implement new hero section",
  type: "public",
  priority: "high",
  assignee: "Sarah Chen",
  likes: 12,
  comments: 5
 },
 {
  id: 2,
  title: "Personal TODO",
  description: "Review quarterly goals",
  type: "private",
  priority: "medium",
  assignee: "Mike Johnson",
  likes: 0,
  comments: 0
 }
])

const filteredTasks = computed(() => {
 return tasks.value.filter(task => task.type === props.type)
})
</script>