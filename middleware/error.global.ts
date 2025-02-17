// middleware/error.global.ts
// Global error handling middleware to catch unhandled errors
export default defineNuxtRouteMiddleware((to, from) => {
  const nuxtApp = useNuxtApp()
  
  nuxtApp.hook('vue:error', (err) => {
    // Handle Vue errors
    const { handleError } = useErrorHandler()
    handleError(err)
  })
})