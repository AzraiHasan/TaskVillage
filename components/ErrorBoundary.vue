<!-- components/ErrorBoundary.vue -->
<!-- Component to handle errors gracefully and provide recovery options -->
<template>
  <div v-if="error" class="p-4 border rounded-lg bg-red-50">
    <div class="flex items-center gap-2 mb-2">
      <div class="text-red-500">
        <Icon name="heroicons:exclamation-circle" />
      </div>
      <h3 class="font-medium text-red-700">{{ error.message }}</h3>
    </div>
    <p class="text-sm text-red-600 mb-4">
      {{ getErrorMessage(error) }}
    </p>
    <div class="flex gap-2">
      <UButton v-if="canRetry" @click="retry" color="red" variant="soft">
        Retry
      </UButton>
      <UButton @click="reset" variant="ghost">
        Dismiss
      </UButton>
    </div>
  </div>
  <slot v-else />
</template>

<script setup>
// Component logic will go here...
</script>