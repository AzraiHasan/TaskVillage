// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  colorMode: {
    preference: 'light'
  },
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@nuxtjs/supabase'
  ],
  
  // Supabase configuration
  supabase: {
    // For local development, you need to set these environment variables:
    // SUPABASE_URL=your-supabase-url
    // SUPABASE_KEY=your-supabase-anon-key
    redirectOptions: {
      login: '/auth/login',
      callback: '/auth/confirm',
      exclude: [
        '/auth/register',
        '/auth/login',
        '/auth/confirm'
      ]
    }
  }
})
