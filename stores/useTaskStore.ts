// stores/useTaskStore.ts
import { defineStore } from 'pinia'

// Define our type constants to ensure consistency throughout the store
const TASK_TYPES = ['public', 'private'] as const
const PRIORITIES = ['low', 'medium', 'high'] as const
const STATUSES = ['not_started', 'in_progress', 'in_review', 'completed'] as const

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

// Define the structure for tasks
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
}

// Define the structure for our store's state
interface TaskState {
  tasks: Task[]
  comments: Comment[]
  nextTaskId: number
  nextCommentId: number
}

// Create and export the store
export const useTaskStore = defineStore('tasks', {
  // Initialize the state with empty arrays and starting IDs
  state: (): TaskState => ({
    tasks: [],
    comments: [],
    nextTaskId: 1,
    nextCommentId: 1
  }),

  // Getters for accessing and filtering tasks
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
    }
  },

  // Actions for modifying the store's state
  actions: {
    // Initialize the store with sample data
    initializeStore() {
      if (this.tasks.length === 0) {
        // Sample tasks demonstrating different states and progress levels
        this.createTask({
          title: "Design new landing page",
          description: "Create wireframes and mockups for the homepage redesign",
          type: "public",
          priority: "medium",
          status: "not_started",
          progress: 0,
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
          assignee: {
            name: "Sarah Chen",
            avatar: "/placeholder-avatar.png"
          }
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
          }
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
          }
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
          }
        })
      }
    },

    // Create a new task
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
        createdAt: new Date().toISOString()
      }
      
      this.tasks.unshift(newTask)
      return newTask
    },

    // Delete a task and its comments
    deleteTask(taskId: number): boolean {
      const taskIndex = this.tasks.findIndex(t => t.id === taskId)
      if (taskIndex === -1) return false

      this.tasks = this.tasks.filter(t => t.id !== taskId)
      this.comments = this.comments.filter(c => c.taskId !== taskId)
      
      return true
    },

    // Toggle like status for a task
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

    // Add a comment to a task
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

    // Update task progress
    updateTaskProgress(taskId: number, progress: number): boolean {
      const taskIndex = this.tasks.findIndex(t => t.id === taskId)
      if (taskIndex === -1) return false

      // Ensure progress is between 0-100
      const validProgress = Math.min(Math.max(Math.round(progress), 0), 100)
      
      // Update the task
      this.tasks[taskIndex] = {
        ...this.tasks[taskIndex],
        progress: validProgress,
        // Update status based on progress
        status: this.determineStatus(validProgress)
      }

      return true
    },

    // Helper method to determine task status based on progress
    determineStatus(progress: number): Status {
      if (progress === 100) return 'completed'
      if (progress > 0) return 'in_progress'
      return 'not_started'
    }
  },

  // Enable state persistence
  persist: true
})

// Export the store type for use in components
export type TaskStore = ReturnType<typeof useTaskStore>