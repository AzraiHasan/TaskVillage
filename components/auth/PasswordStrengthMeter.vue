<!-- components/auth/PasswordStrengthMeter.vue -->
<template>
 <div class="mt-1">
  <div class="flex items-center">
   <div class="w-full bg-gray-200 rounded-full h-2.5">
    <div class="h-full rounded-full" :style="{ width: `${strength}%` }" :class="strengthColor"></div>
   </div>
   <span class="ml-2 text-xs">{{ strengthLabel }}</span>
  </div>
  <ul v-if="showRequirements" class="text-xs text-gray-600 mt-1 space-y-1">
   <li :class="{ 'text-green-600': hasMinLength }">
    At least 10 characters
   </li>
   <li :class="{ 'text-green-600': hasUppercase }">
    At least one uppercase letter
   </li>
   <li :class="{ 'text-green-600': hasLowercase }">
    At least one lowercase letter
   </li>
   <li :class="{ 'text-green-600': hasNumber }">
    At least one number
   </li>
   <li :class="{ 'text-green-600': hasSpecial }">
    At least one special character
   </li>
  </ul>
 </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  password: string
  showRequirements?: boolean
}>()

// Check different password criteria
const hasMinLength = computed(() => props.password.length >= 10)
const hasUppercase = computed(() => /[A-Z]/.test(props.password))
const hasLowercase = computed(() => /[a-z]/.test(props.password))
const hasNumber = computed(() => /[0-9]/.test(props.password))
const hasSpecial = computed(() => /[^A-Za-z0-9]/.test(props.password))

// Calculate strength percentage
const strength = computed(() => {
  let score = 0
  if (hasMinLength.value) score += 20
  if (hasUppercase.value) score += 20
  if (hasLowercase.value) score += 20
  if (hasNumber.value) score += 20
  if (hasSpecial.value) score += 20
  return score
})

// Determine strength label
const strengthLabel = computed(() => {
  if (strength.value < 40) return 'Weak'
  if (strength.value < 80) return 'Medium'
  return 'Strong'
})

// Determine strength color
const strengthColor = computed(() => {
  if (strength.value < 40) return 'bg-red-500'
  if (strength.value < 80) return 'bg-yellow-500'
  return 'bg-green-500'
})
</script>