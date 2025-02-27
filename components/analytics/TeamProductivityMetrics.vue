<!-- components/analytics/TeamProductivityMetrics.vue -->
<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="font-medium">Team Productivity</h3>
        <USelect v-model="timeFrame" :options="timeFrameOptions" size="sm" />
      </div>
    </template>

    <div class="space-y-6">
      <!-- Team Member Productivity Bars -->
      <div v-if="teamData.length > 0" class="space-y-4">
        <div v-for="member in teamData" :key="member.name" class="space-y-1">
          <div class="flex justify-between text-sm">
            <div class="flex items-center">
              <UAvatar :src="member.avatar" size="xs" class="mr-2" />
              <span>{{ member.name }}</span>
            </div>
            <span class="font-medium">{{ member.tasksCompleted }} tasks</span>
          </div>
          <div class="relative h-6 bg-gray-100 rounded-full overflow-hidden">
            <div class="h-full bg-primary-500 rounded-full" :style="{ width: `${member.percentage}%` }"></div>
          </div>
        </div>
      </div>

      <!-- No Data Message -->
      <div v-else class="text-center py-4 text-gray-500">
        No completed tasks found for the selected time frame
      </div>

      <!-- Team Stats Summary -->
      <div class="grid grid-cols-3 gap-4 pt-4 border-t">
        <div class="text-center">
          <div class="text-2xl font-bold text-primary-600">{{ totalCompletedTasks }}</div>
          <div class="text-xs text-gray-500">Total Completed</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-600">{{ averageTasksPerMember.toFixed(1) }}</div>
          <div class="text-xs text-gray-500">Avg per Member</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600">{{ topPerformerName }}</div>
          <div class="text-xs text-gray-500">Top Performer</div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup>
import { useTaskStore } from '~/stores/useTaskStore'

const props = defineProps({
  workspaceId: {
    type: Number,
    default: null
  }
})

const taskStore = useTaskStore()

// Time frame selector options
const timeFrameOptions = [
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'All Time', value: 'all' }
]
const timeFrame = ref('all')

// Sample team members (in a real app, this would come from a user store)
const teamMembers = [
  { id: 'user1', name: 'Sarah Chen', avatar: '/placeholder-avatar.png' },
  { id: 'user2', name: 'Alex Johnson', avatar: '/placeholder-avatar.png' },
  { id: 'user3', name: 'Miguel Rodriguez', avatar: '/placeholder-avatar.png' },
  { id: 'user4', name: 'Layla Kim', avatar: '/placeholder-avatar.png' }
]

// Get filtered tasks based on workspace and completed status
const completedTasks = computed(() => {
  let tasks = taskStore.tasks.filter(task => task.status === 'completed')
  
  // Filter by workspace if provided
  if (props.workspaceId) {
    tasks = tasks.filter(task => task.workspaceId === props.workspaceId)
  }
  
  // Filter by time frame
  if (timeFrame.value !== 'all') {
    const now = new Date()
    let cutoffDate = new Date()
    
    if (timeFrame.value === 'week') {
      cutoffDate.setDate(now.getDate() - 7) // Last 7 days
    } else if (timeFrame.value === 'month') {
      cutoffDate.setMonth(now.getMonth() - 1) // Last 30 days
    }
    
    tasks = tasks.filter(task => new Date(task.createdAt) >= cutoffDate)
  }
  
  return tasks
})

// Calculate team member productivity
const teamData = computed(() => {
  // Create a map of team members with completed task counts
  const memberTaskCounts = {}
  
  // Initialize with all team members
  teamMembers.forEach(member => {
    memberTaskCounts[member.id] = {
      id: member.id,
      name: member.name,
      avatar: member.avatar,
      tasksCompleted: 0
    }
  })
  
  // Count completed tasks per assignee
  completedTasks.value.forEach(task => {
    // In a real app, we would use the assignee's ID
    // For now, we'll use a simple name match
    const memberId = teamMembers.find(m => m.name === task.assignee.name)?.id
    
    if (memberId && memberTaskCounts[memberId]) {
      memberTaskCounts[memberId].tasksCompleted++
    }
  })
  
  // Convert to array and calculate percentages
  const result = Object.values(memberTaskCounts)
    .filter(member => member.tasksCompleted > 0) // Only include members with completed tasks
  
  const maxTasks = Math.max(...result.map(m => m.tasksCompleted), 1)
  
  // Calculate percentage relative to top performer
  result.forEach(member => {
    member.percentage = Math.round((member.tasksCompleted / maxTasks) * 100)
  })
  
  // Sort by tasks completed (descending)
  return result.sort((a, b) => b.tasksCompleted - a.tasksCompleted)
})

// Computed summaries
const totalCompletedTasks = computed(() => completedTasks.value.length)

const averageTasksPerMember = computed(() => {
  if (teamData.value.length === 0) return 0
  return totalCompletedTasks.value / teamData.value.length
})

const topPerformerName = computed(() => {
  if (teamData.value.length === 0) return 'N/A'
  return teamData.value[0].name
})
</script>