// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  colorMode: {
    preference: 'light'
  },
  modules: ['nuxt-auth-utils','@nuxt/ui','@pinia/nuxt','pinia-plugin-persistedstate/nuxt'],
  imports: {
    autoImport: true,
  },
  // Add security headers using routeRules
  routeRules: {
    // Apply these headers to all routes
    '/**': {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
      }
    }
  }
})