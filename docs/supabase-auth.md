# TaskVillage Supabase Authentication

This document explains how to set up and use the Supabase authentication system that has been implemented in TaskVillage.

## Setup

1. **Create a Supabase Project**
   - Sign up or log in at [https://supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon/public key from the API settings

2. **Configure Environment Variables**
   - Copy the `.env.template` file to `.env` in the project root
   ```bash
   cp .env.template .env
   ```
   - Fill in your Supabase URL and key in the `.env` file:
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_KEY=your-anon-key
   ```

3. **Enable Email Authentication in Supabase**
   - In your Supabase dashboard, go to Authentication > Providers
   - Ensure Email provider is enabled
   - Configure the settings according to your preferences (password strength, etc.)

## Authentication Features

The following authentication features have been implemented:

### User Registration
- Route: `/auth/register`
- Users can sign up with email, password, and name
- User profile information is stored in Supabase user metadata

### User Login
- Route: `/auth/login`
- Users can log in with their email and password
- Successful login redirects to the dashboard

### Email Confirmation
- Route: `/auth/confirm`
- If email confirmation is required, users are directed to this page after registration
- They must verify their email before gaining full access

### User Logout
- Available from the user dropdown menu in the navigation bar
- Logs the user out and redirects to the login page

### Route Protection
- Protected routes require authentication
- Unauthenticated users are redirected to the login page
- Public routes (`/`, `/auth/login`, `/auth/register`, `/auth/confirm`) are accessible without authentication

## File Structure

- **Authentication Pages**
  - `pages/auth/login.vue` - Login form
  - `pages/auth/register.vue` - Registration form
  - `pages/auth/confirm.vue` - Email confirmation page

- **Middleware**
  - `middleware/auth.ts` - Checks authentication for routes
  - `middleware/guest.ts` - Redirects authenticated users from auth pages

- **Layout**
  - `layouts/default.vue` - Includes navigation with authentication UI and logout functionality

- **Plugins**
  - `plugins/auth.ts` - Applies auth middleware globally

- **Configuration**
  - `nuxt.config.ts` - Contains Supabase configuration
  - `.env.template` - Template for environment variables

## Usage Tips

1. **User Data**: Access the current user with `useSupabaseUser()` in your components
2. **Client API**: Use `useSupabaseClient()` to access the Supabase client for other operations
3. **Protected Content**: Wrap content that should only be visible to authenticated users:
   ```vue
   <template v-if="user">Protected content here</template>
   ```

## Additional Supabase Features

You can extend this authentication system with additional Supabase features:

- **Social Logins**: Enable OAuth providers in Supabase dashboard
- **Row Level Security**: Control database access based on user ID
- **Storage**: Use Supabase Storage for user uploads with permissions
- **Edge Functions**: Create serverless functions for backend logic
