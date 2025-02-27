<!-- components/analytics/TaskTrendsChart.vue -->
<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="font-medium">Task Trends</h3>
        <USelect v-model="timeRange" :options="timeRangeOptions" size="sm" />
      </div>
    </template>

    <div class="h-64 w-full">
      <div v-if="chartData.length > 0">
        <div class="text-xs text-gray-500 mb-2">Tasks created vs completed over time</div>
        <div class="w-full h-60"> <!-- Fixed height container -->
          <LineChart :data="chartJsData" :options="chartOptions" />
        </div>
      </div>
      <div v-else class="h-full flex items-center justify-center text-gray-500">
        No task data available for the selected time range
      </div>
    </div>
  </UCard>
</template>

<script setup>
import { useTaskStore } from '~/stores/useTaskStore'
import { format, subDays, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns'
import { Line as LineChart } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const props = defineProps({
  workspaceId: {
    type: Number,
    default: null
  }
})

const taskStore = useTaskStore()

// Time range options for filtering
const timeRangeOptions = [
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 14 days', value: 14 },
  { label: 'Last 30 days', value: 30 }
]
const timeRange = ref(7)

// Filtered tasks based on workspace selection
const filteredTasks = computed(() => {
  return props.workspaceId
    ? taskStore.tasks.filter(task => task.workspaceId === props.workspaceId)
    : taskStore.tasks
})

// Generate chart data based on selected time range
const chartData = computed(() => {
  if (filteredTasks.value.length === 0) return []

  const today = new Date()
  const days = timeRange.value
  const data = []

  // For each day in the range
  for (let i = days - 1;i >= 0;i--) {
    const currentDate = subDays(today, i)
    const dayStart = startOfDay(currentDate)
    const dayEnd = endOfDay(currentDate)

    // Count tasks created on this day
    const createdCount = filteredTasks.value.filter(task => {
      const createdDate = parseISO(task.createdAt)
      return isWithinInterval(createdDate, { start: dayStart, end: dayEnd })
    }).length

    // Count tasks completed on this day (approximation - in a real app would use a completedAt field)
    // For this demo, we'll assume completed tasks with a similar timestamp were completed on that day
    const completedCount = filteredTasks.value.filter(task => {
      if (task.status !== 'completed') return false

      // Since we don't have actual completedAt timestamps, we'll use createdAt as a proxy
      // In a real app, you would use a dedicated completedAt field
      const taskDate = parseISO(task.createdAt)
      return isWithinInterval(taskDate, { start: dayStart, end: dayEnd }) && task.status === 'completed'
    }).length

    // Add day data to chart
    data.push({
      date: format(currentDate, 'yyyy-MM-dd'),
      label: format(currentDate, 'MMM d'),
      created: createdCount,
      completed: completedCount
    })
  }

  return data
})

const chartOptions = computed(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0 // Only show whole numbers
        }
      }
    },
    plugins: {
      legend: {
        position: 'bottom'
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    }
  }
})

const chartJsData = computed(() => {
  console.log('Original chartData:', chartData.value); // Debug log

  if (chartData.value.length === 0) return {
    labels: [],
    datasets: []
  }

  return {
    labels: chartData.value.map(item => item.label),
    datasets: [
      {
        label: 'Created',
        data: chartData.value.map(item => item.created),
        backgroundColor: 'rgba(59, 130, 246, 0.2)', // Light blue
        borderColor: '#3b82f6', // Blue
        borderWidth: 2,
        tension: 0.1
      },
      {
        label: 'Completed',
        data: chartData.value.map(item => item.completed),
        backgroundColor: 'rgba(16, 185, 129, 0.2)', // Light green
        borderColor: '#10b981', // Green
        borderWidth: 2,
        tension: 0.1
      }
    ]
  }
})
</script>