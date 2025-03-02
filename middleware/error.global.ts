// middleware/error.global.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const nuxtApp = useNuxtApp()
  
  nuxtApp.hook('vue:error', (err, instance, info) => {
    console.error('Global Vue Error:', err)
    console.log('Component:', instance)
    console.log('Error Info:', info)

    // Optional: Send error to monitoring service
    const { handleError } = useErrorHandler()
    handleError(err)
  })
})