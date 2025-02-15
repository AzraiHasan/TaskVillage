// stores/useTaskStore.ts
import { defineStore } from 'pinia'

// Define our type constants to ensure consistency throughout the store
export const TASK_TYPES = ['public', 'private'] as const
export const PRIORITIES = ['low', 'medium', 'high'] as const
export const STATUSES = ['not_started', 'in_progress', 'in_review', 'completed'] as const

// Type definitions using the constants above
type TaskType = typeof TASK_TYPES[number]
type Priority = typeof PRIORITIES[number]
type Status = typeof STATUSES[number]

// Define the structure for comments on tasks
export interface Comment {
  id: number
  taskId: number
  content: string
  author: {
    name: string
    avatar: string
  }
  createdAt: string
  taskType: TaskType
}

// Define the structure for tasks, now including workspace context
export interface Task {
  id: number
  title: string
  description: string
  type: TaskType
  priority: Priority
  status: Status
  dueDate: string | null
  progress: number
  assignee: {
    name: string
    avatar: string
  }
  likes: number
  likedBy: string[]
  comments: number
  createdAt: string
  workspaceId: number | null  // Now required, not optional
}

// Define the structure for our store's state
interface TaskState {
  tasks: Task[]
  comments: Comment[]
  nextTaskId: number
  nextCommentId: number
  workspaceId: number | null
  taskFilters: {
    status: Status | null
    priority: Priority | null
    assignee: string | null
  }
}

// Create and export the store
export const useTaskStore = defineStore('tasks', {
  state: (): TaskState => ({
    tasks: [],
    comments: [],
    nextTaskId: 1,
    nextCommentId: 1,
    workspaceId: null,
    taskFilters: {
      status: null,
      priority: null,
      assignee: null
    }
  }),

  getters: {
    // Get all public tasks
    publicTasks: (state): Task[] => 
      state.tasks.filter(task => task.type === 'public'),
    
    // Get all private tasks
    privateTasks: (state): Task[] =>
      state.tasks.filter(task => task.type === 'private'),
    
    // Get a specific task by ID
    getTaskById: (state) => (id: number): Task | undefined =>
      state.tasks.find(task => task.id === id),
    
    // Get comments for a specific task
    getCommentsByTaskId: (state) => (taskId: number): Comment[] => {
      const task = state.tasks.find(t => t.id === taskId)
      if (!task) return []
      
      return state.comments.filter(comment => 
        comment.taskId === taskId && comment.taskType === task.type
      )
    },

    // Get tasks for current workspace
    currentWorkspaceTasks: (state): Task[] => {
      if (!state.workspaceId) return []
      return state.tasks.filter(task => task.workspaceId === state.workspaceId)
    },

    // Get filtered tasks based on current filters and workspace
    filteredTasks: (state) => {
      let filtered = state.workspaceId 
        ? state.tasks.filter(task => task.workspaceId === state.workspaceId)
        : state.tasks

      if (state.taskFilters.status) {
        filtered = filtered.filter(task => task.status === state.taskFilters.status)
      }

      if (state.taskFilters.priority) {
        filtered = filtered.filter(task => task.priority === state.taskFilters.priority)
      }

      if (state.taskFilters.assignee) {
        filtered = filtered.filter(task => task.assignee.name === state.taskFilters.assignee)
      }

      return filtered
    }
  },

  actions: {
    // Initialize the store with sample data
    initializeStore() {
      if (this.tasks.length === 0) {
        // Sample workspace IDs for demonstration
        const workspace1 = 1
        const workspace2 = 2

        this.createTask({
          title: "Design new landing page",
          description: "Create wireframes and mockups for the homepage redesign",
          type: "public",
          priority: "medium",
          status: "not_started",
          progress: 0,
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          assignee: {
            name: "Sarah Chen",
            avatar: "/placeholder-avatar.png"
          },
          workspaceId: workspace1
        })

        this.createTask({
          title: "Implement user authentication",
          description: "Set up OAuth and JWT authentication flow",
          type: "public",
          priority: "high",
          status: "in_progress",
          progress: 75,
          assignee: {
            name: "Mike Johnson",
            avatar: "/placeholder-avatar.png"
          },
          workspaceId: workspace1
        })

        this.createTask({
          title: "Write API documentation",
          description: "Document all endpoints and request/response formats",
          type: "private",
          priority: "low",
          status: "in_progress",
          progress: 25,
          assignee: {
            name: "Alex Wong",
            avatar: "/placeholder-avatar.png"
          },
          workspaceId: workspace2
        })

        this.createTask({
          title: "Setup development environment",
          description: "Configure Docker and development tools",
          type: "public",
          priority: "medium",
          status: "completed",
          progress: 100,
          assignee: {
            name: "Lisa Park",
            avatar: "/placeholder-avatar.png"
          },
          workspaceId: workspace2
        })
      }
    },

    // Create a new task with workspace context
    createTask(taskData: Partial<Omit<Task, 'id' | 'likes' | 'likedBy' | 'comments' | 'createdAt'>>): Task {
      const newTask: Task = {
        id: this.nextTaskId++,
        title: taskData.title || '',
        description: taskData.description || '',
        type: taskData.type || 'public',
        priority: taskData.priority || 'medium',
        status: taskData.status || 'not_started',
        dueDate: taskData.dueDate || null,
        progress: taskData.progress || 0,
        assignee: taskData.assignee || {
          name: 'Current User',
          avatar: '/placeholder-avatar.png'
        },
        likes: 0,
        likedBy: [],
        comments: 0,
        createdAt: new Date().toISOString(),
        workspaceId: taskData.workspaceId || this.workspaceId || null
      }
      
      this.tasks.unshift(newTask)
      return newTask
    },

    // Set current workspace and reset filters
    setWorkspace(workspaceId: number | null) {
      this.workspaceId = workspaceId
      this.taskFilters = {
        status: null,
        priority: null,
        assignee: null
      }
    },

    // Update task filters
    updateFilters(filters: Partial<TaskState['taskFilters']>) {
      this.taskFilters = {
        ...this.taskFilters,
        ...filters
      }
    },

    // Existing actions remain unchanged
    deleteTask(taskId: number): boolean {
      const taskIndex = this.tasks.findIndex(t => t.id === taskId)
      if (taskIndex === -1) return false

      this.tasks = this.tasks.filter(t => t.id !== taskId)
      this.comments = this.comments.filter(c => c.taskId !== taskId)
      
      return true
    },

    toggleLike(taskId: number, userId: string): void {
      const task = this.tasks.find(t => t.id === taskId)
      if (!task) return

      const isLiked = task.likedBy.includes(userId)
      if (isLiked) {
        task.likedBy = task.likedBy.filter(id => id !== userId)
        task.likes = Math.max(0, task.likes - 1)
      } else {
        task.likedBy.push(userId)
        task.likes++
      }
    },

    addComment(taskId: number, content: string, author: { name: string, avatar: string }): Comment {
      const task = this.tasks.find(t => t.id === taskId)
      if (!task) throw new Error('Task not found')

      const newComment: Comment = {
        id: this.nextCommentId++,
        taskId,
        taskType: task.type,
        content,
        author,
        createdAt: new Date().toISOString()
      }

      this.comments.push(newComment)
      task.comments++

      return newComment
    },

    updateTaskProgress(taskId: number, progress: number): boolean {
      const taskIndex = this.tasks.findIndex(t => t.id === taskId)
      if (taskIndex === -1) return false

      const validProgress = Math.min(Math.max(Math.round(progress), 0), 100)
      
      this.tasks[taskIndex] = {
        ...this.tasks[taskIndex],
        progress: validProgress,
        status: this.determineStatus(validProgress)
      }

      return true
    },

    determineStatus(progress: number): Status {
      if (progress === 100) return 'completed'
      if (progress > 0) return 'in_progress'
      return 'not_started'
    }
  },

  persist: true
})

export type TaskStore = ReturnType<typeof useTaskStore>