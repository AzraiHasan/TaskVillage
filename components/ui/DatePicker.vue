<!-- components/ui/DatePicker.vue -->

<template>
  <div class="p-4 w-72">
    <div class="space-y-4">
      <!-- Month and Year Navigation -->
      <div class="flex items-center justify-between">
        <UButton icon="i-heroicons-chevron-left" color="gray" variant="ghost" @click="previousMonth" />
        <span class="font-medium">
          {{ format(displayDate, 'MMMM yyyy') }}
        </span>
        <UButton icon="i-heroicons-chevron-right" color="gray" variant="ghost" @click="nextMonth" />
      </div>

      <!-- Calendar Grid -->
      <div class="grid grid-cols-7 gap-1">
        <!-- Weekday Headers -->
        <div v-for="day in weekDays" :key="day" class="text-center text-sm text-gray-500 font-medium p-2">
          {{ day }}
        </div>

        <!-- Calendar Days -->
        <template v-for="(date, index) in calendarDays" :key="index">
          <UButton v-if="date" :variant="isSelectedDate(date) ? 'solid' : 'ghost'"
            :color="isSelectedDate(date) ? 'primary' : 'gray'" :disabled="isDisabled(date)" class="aspect-square"
            @click="selectDate(date)">
            {{ date.getDate() }}
          </UButton>
          <div v-else class="aspect-square" />
        </template>
      </div>

      <!-- Today Button -->
      <div class="flex justify-center">
        <UButton variant="link" color="primary" @click="selectToday">
          Today
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameDay, startOfDay } from 'date-fns'

const props = defineProps<{
  modelValue: Date | null
  min?: Date
  max?: Date
}>()

const emit = defineEmits<{
  'update:modelValue': [date: Date]
  'close': []
}>()

// Initialize display date either from model value or current date
const displayDate = ref(props.modelValue ? new Date(props.modelValue) : new Date())

// Week days header
const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

// Calculate calendar days for the current month
const calendarDays = computed(() => {
  const start = startOfMonth(displayDate.value)
  const end = endOfMonth(displayDate.value)
  
  // Get all days in the month
  const days = eachDayOfInterval({ start, end })
  
  // Calculate padding days
  const firstDayOfMonth = start.getDay()
  const lastDayOfMonth = end.getDay()
  
  // Create arrays for padding (using null for empty slots)
  const prefixDays = Array(firstDayOfMonth).fill(null)
  const suffixDays = Array(6 - lastDayOfMonth).fill(null)
  
  return [...prefixDays, ...days, ...suffixDays]
})

// Navigation methods
const previousMonth = () => {
  displayDate.value = subMonths(displayDate.value, 1)
}

const nextMonth = () => {
  displayDate.value = addMonths(displayDate.value, 1)
}

// Date selection methods
const isSelectedDate = (date: Date | null): boolean => {
  if (!date || !props.modelValue) return false
  return isSameDay(date, props.modelValue)
}

const isDisabled = (date: Date | null): boolean => {
  if (!date) return true
  const today = startOfDay(new Date())
  
  // Always allow today and future dates
  if (props.min && date < props.min) return true
  if (props.max && date > props.max) return true
  
  return false
}

const selectDate = (date: Date) => {
  if (!isDisabled(date)) {
    emit('update:modelValue', date)
    emit('close')
  }
}

const selectToday = () => {
  const today = startOfDay(new Date())
  if (!isDisabled(today)) {
    emit('update:modelValue', today)
    emit('close')
  }
}

// Watch for external modelValue changes
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    displayDate.value = new Date(newValue)
  }
})
</script>