// stores/useTaskStore.ts
import { defineStore } from 'pinia'

const TASK_TYPES = ['public', 'private'] as const
const PRIORITIES = ['low', 'medium', 'high'] as const
const STATUSES = ['not_started', 'in_progress', 'in_review', 'completed'] as const

type TaskType = typeof TASK_TYPES[number]
type Priority = typeof PRIORITIES[number]
type Status = typeof STATUSES[number]

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

interface TaskState {
  tasks: Task[]
  comments: Comment[]
  nextTaskId: number
  nextCommentId: number
}

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
    initializeStore() {
  // Only add sample data if the store is empty
  if (this.tasks.length === 0) {
    // Test task 1: Not Started
    this.createTask({
      title: "Design new landing page",
      description: "Create wireframes and mockups for the homepage redesign",
      type: "public",
      priority: "medium",
      status: "not_started",
      assignee: {
        name: "Sarah Chen",
        avatar: "/placeholder-avatar.png"
      }
    })

    // Test task 2: In Progress
    this.createTask({
      title: "Implement user authentication",
      description: "Set up OAuth and JWT authentication flow",
      type: "public",
      priority: "high",
      status: "in_progress",
      assignee: {
        name: "Mike Johnson",
        avatar: "/placeholder-avatar.png"
      }
    })

    // Test task 3: In Review
    this.createTask({
      title: "Write API documentation",
      description: "Document all endpoints and request/response formats",
      type: "public",
      priority: "low",
      status: "in_review",
      assignee: {
        name: "Alex Wong",
        avatar: "/placeholder-avatar.png"
      }
    })

    // Test task 4: Completed
    this.createTask({
      title: "Setup development environment",
      description: "Configure Docker and development tools",
      type: "public",
      priority: "medium",
      status: "completed",
      assignee: {
        name: "Lisa Park",
        avatar: "/placeholder-avatar.png"
      }
    })
  }
},

    createTask(taskData: Partial<Omit<Task, 'id' | 'likes' | 'likedBy' | 'comments' | 'createdAt'>>) {
      const newTask: Task = {
        id: this.nextTaskId++,
        title: taskData.title || '',
        description: taskData.description || '',
        type: taskData.type || 'public',
        priority: taskData.priority || 'medium',
        status: taskData.status || 'not_started',    // Default to not started
        dueDate: taskData.dueDate || null,          // Default to no due date
        progress: taskData.progress || 0,            // Default to 0% progress
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

export type TaskStore = ReturnType<typeof useTaskStore>