# Project Structure - Social Task Management App

```
social-task-app/
├── .nuxt/                      # Auto-generated build directory
├── assets/                     # Static assets that will be processed
│   ├── css/                   
│   │   └── main.css           # Global CSS styles
│   └── images/                # Image assets
├── components/                 # Vue components
│   ├── auth/                  # Authentication related components
│   │   ├── LoginForm.vue
│   │   └── RegisterForm.vue
│   ├── layout/                # Layout components
│   │   ├── AppHeader.vue
│   │   ├── AppFooter.vue
│   │   ├── Sidebar.vue
│   │   └── NotificationBar.vue
│   ├── task/                  # Task-related components
│   │   ├── TaskCard.vue       # Individual task display
│   │   ├── TaskForm.vue       # Task creation/edit form
│   │   ├── TaskList.vue       # List of tasks
│   │   ├── TaskComments.vue   # Task comments section
│   │   └── TaskInteractions.vue # Likes and social interactions
│   ├── user/                  # User-related components
│   │   ├── UserProfile.vue
│   │   ├── UserAvatar.vue
│   │   └── FollowButton.vue
│   └── workspace/             # Workspace components
│       ├── WorkspaceSelect.vue
│       └── WorkspaceSettings.vue
├── composables/               # Reusable Vue composition functions
│   ├── useAuth.ts            # Authentication logic
│   ├── useTasks.ts           # Task management logic
│   ├── useWorkspace.ts       # Workspace management
│   └── useNotifications.ts   # Notification handling
├── layouts/                   # Layout templates
│   ├── default.vue           # Default layout
│   └── auth.vue              # Authentication pages layout
├── middleware/                # Navigation guards and middleware
│   ├── auth.ts               # Authentication checking
│   └── workspace.ts          # Workspace validation
├── pages/                     # Application routes
│   ├── index.vue             # Home page/Task feed
│   ├── auth/
│   │   ├── login.vue
│   │   └── register.vue
│   ├── tasks/
│   │   ├── [id].vue         # Individual task view
│   │   └── create.vue       # Task creation page
│   ├── profile/
│   │   └── [username].vue   # User profile page
│   └── workspace/
│       ├── [id].vue         # Workspace view
│       └── settings.vue     # Workspace settings
├── plugins/                  # Nuxt plugins
│   ├── api.ts               # API client configuration
│   └── websocket.ts         # WebSocket connection handler
├── public/                   # Static files
│   ├── favicon.ico
│   └── robots.txt
├── server/                   # Server-side code
│   ├── api/                 # API routes
│   │   ├── auth/           
│   │   │   ├── login.post.ts
│   │   │   └── register.post.ts
│   │   ├── tasks/
│   │   │   ├── [id].get.ts
│   │   │   ├── [id].put.ts
│   │   │   ├── [id].delete.ts
│   │   │   └── index.post.ts
│   │   └── workspace/
│   │       └── [id].get.ts
│   ├── middleware/          # Server middleware
│   │   └── auth.ts         # Authentication middleware
│   ├── utils/              # Server utilities
│   │   ├── auth.ts        # Authentication helpers
│   │   └── database.ts    # Database helpers
│   └── websocket/         # WebSocket handlers
│       └── notifications.ts
├── types/                   # TypeScript type definitions
│   ├── task.ts
│   ├── user.ts
│   └── workspace.ts
├── utils/                   # Shared utilities
│   ├── date.ts            # Date formatting
│   └── validation.ts      # Form validation
├── .env                     # Environment variables
├── .gitignore
├── app.vue                  # App root component
├── nuxt.config.ts           # Nuxt configuration
├── package.json
├── tailwind.config.js       # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## Key Directory Explanations

### Components Organization
The components directory follows a feature-based structure, making it easy to locate and maintain related components. Each feature (auth, task, user, workspace) has its own directory containing all relevant components.

### Server Directory
The server directory contains all server-side logic, organized by feature. The API routes follow the REST convention and use Nuxt's file-based routing system. Each endpoint is in its own file, named according to the HTTP method it handles.

### Composables
Composables contain reusable logic that can be shared across components. They're organized by feature and handle specific aspects of the application's functionality, such as authentication, task management, and notifications.

### Types
The types directory contains TypeScript interfaces and types used throughout the application. This ensures consistent data structures and improves development experience with better type checking and autocompletion.

## Best Practices Implementation

### State Management
- Utilize Nuxt's built-in state management through composables
- Leverage Vue's Reactivity Transform for cleaner code
- Use `useState` for server-shared state

### API Organization
- RESTful API endpoints organized by resource
- Consistent naming conventions for API routes
- Clear separation of concerns between API handlers

### Type Safety
- Full TypeScript implementation
- Shared types between client and server
- Strong typing for API responses and requests

### Performance Considerations
- Component code splitting for optimal loading
- Lazy loading for routes and components
- Efficient asset management

## Development Workflow

### Getting Started
1. Clone the repository
2. Install dependencies: `npm install`
3. Create `.env` file with required environment variables
4. Run development server: `npm run dev`

### Development Commands
- `npm run dev`: Start development server
- `npm run build`: Build production application
- `npm run generate`: Generate static version
- `npm run preview`: Preview production build

## Additional Notes

### Environment Variables
When needed, create a `.env` file with the following variables:
```
NUXT_PUBLIC_API_BASE=http://localhost:3000
NUXT_AUTH_SECRET=your-auth-secret
NUXT_DATABASE_URL=your-database-url
```

### Database Integration
Add your preferred database configuration in `server/utils/database.ts`. The project structure supports any database choice, but make sure to update the types and utilities accordingly.

### WebSocket Implementation
The WebSocket setup is included in the plugins directory and server-side handlers. This enables real-time features like notifications and live updates.

### Static Asset Handling
Place all static assets in the public directory for direct access, or in the assets directory if they need to be processed by the build system.