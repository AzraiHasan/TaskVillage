// stores/useTaskStore.ts
import { defineStore } from 'pinia'

// Define our valid types and priorities as const arrays
const TASK_TYPES = ['public', 'private'] as const
const PRIORITIES = ['low', 'medium', 'high'] as const

// Create type aliases from our const arrays
type TaskType = typeof TASK_TYPES[number]
type Priority = typeof PRIORITIES[number]

// Interface definitions with proper typing
interface Comment {
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

interface Task {
  id: number
  title: string
  description: string
  type: TaskType
  priority: Priority
  assignee: {
    name: string
    avatar: string
  }
  likes: number
  likedBy: string[]
  comments: number
  createdAt: string
}

// Define the store state interface
interface TaskState {
  tasks: Task[]
  comments: Comment[]
  nextTaskId: number
  nextCommentId: number
}

// Store definition with explicit action and getter types
export const useTaskStore = defineStore('tasks', {
  state: (): TaskState => ({
    tasks: [],
    comments: [],
    nextTaskId: 1,
    nextCommentId: 1
  }),

  getters: {
    publicTasks: (state): Task[] => 
      state.tasks.filter(task => task.type === 'public'),
    
    privateTasks: (state): Task[] =>
      state.tasks.filter(task => task.type === 'private'),
    
    getTaskById: (state) => (id: number): Task | undefined =>
      state.tasks.find(task => task.id === id),
    
    getCommentsByTaskId: (state) => (taskId: number): Comment[] => {
      const task = state.tasks.find(t => t.id === taskId)
      if (!task) return []
      
      return state.comments.filter(comment => 
        comment.taskId === taskId && comment.taskType === task.type
      )
    }
  },

  actions: {
    // Initialize store with sample data if needed
    initializeStore() {
      if (this.tasks.length === 0) {
        this.createTask({
          title: "Update landing page design",
          description: "Implement new hero section with enhanced visual appeal",
          type: "public",
          priority: "high",
          assignee: {
            name: "Sarah Chen",
            avatar: "/placeholder-avatar.png"
          }
        })
      }
    },

    // Create a new task
    createTask(taskData: Partial<Omit<Task, 'id' | 'likes' | 'likedBy' | 'comments' | 'createdAt'>>) {
      const newTask: Task = {
        id: this.nextTaskId++,
        title: taskData.title || '',
        description: taskData.description || '',
        type: taskData.type || 'public',
        priority: taskData.priority || 'medium',
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

      if (!task.likedBy) {
        task.likedBy = []
      }

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
    }
  },

  persist: true
})

// Export type for use in components
export type TaskStore = ReturnType<typeof useTaskStore>