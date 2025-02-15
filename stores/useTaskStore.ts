// stores/useTaskStore.ts
import { defineStore } from 'pinia'
import { useUser } from '~/composables/useUser'

export const TASK_TYPES = ['public', 'private'] as const
export const PRIORITIES = ['low', 'medium', 'high'] as const
export const STATUSES = ['not_started', 'in_progress', 'in_review', 'completed'] as const

type TaskType = typeof TASK_TYPES[number]
type Priority = typeof PRIORITIES[number]
type Status = typeof STATUSES[number]

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
  workspaceId: number | null
}

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
    publicTasks: (state): Task[] => 
      state.tasks.filter(task => 
        task.type === 'public' && 
        task.workspaceId === state.workspaceId
      ),
    
    privateTasks: (state): Task[] =>
      state.tasks.filter(task => 
        task.type === 'private' && 
        task.workspaceId === state.workspaceId
      ),
    
    getTaskById: (state) => (id: number): Task | undefined =>
      state.tasks.find(task => task.id === id),
    
    getCommentsByTaskId: (state) => (taskId: number): Comment[] => {
      const task = state.tasks.find(t => t.id === taskId)
      if (!task) return []
      
      return state.comments.filter(comment => 
        comment.taskId === taskId && comment.taskType === task.type
      )
    },

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
    initializeStore() {
      const { getCurrentUser } = useUser()
      const currentUser = getCurrentUser()
      
      console.log('Initializing task store with user:', currentUser)
      
      if (!currentUser) {
        console.warn('No user found during store initialization')
        return
      }
      
      if (this.tasks.length === 0) {
        console.log('Creating initial tasks...')
        this.createTask({
          title: "Setup development environment",
          description: "Configure Docker and development tools",
          type: "public",
          priority: "medium",
          status: "completed",
          progress: 100,
          assignee: {
            name: currentUser.name,
            avatar: currentUser.avatar
          },
          workspaceId: 1
        })

        this.createTask({
          title: "Write API documentation",
          description: "Document all endpoints and request/response formats",
          type: "private",
          priority: "low",
          status: "in_progress",
          progress: 25,
          assignee: {
            name: currentUser.name,
            avatar: currentUser.avatar
          },
          workspaceId: 1
        })
        console.log('Initial tasks created:', this.tasks)
      }
    },

    createTask(taskData: Partial<Omit<Task, 'id' | 'likes' | 'likedBy' | 'comments' | 'createdAt'>>): Task {
      const { getCurrentUser } = useUser()
      const currentUser = getCurrentUser()
      
     console.log('Creating new task with user:', currentUser)
      
      if (!currentUser) {
      throw new Error('No user found while creating task')
      }
      
      const newTask: Task = {
        id: this.nextTaskId++,
        title: taskData.title || '',
        description: taskData.description || '',
        type: taskData.type || 'public',
        priority: taskData.priority || 'medium',
        status: taskData.status || 'not_started',
        dueDate: taskData.dueDate || null,
        progress: taskData.progress || 0,
        assignee: {
          name: currentUser.name,
          avatar: currentUser.avatar
        },
        likes: 0,
        likedBy: [],
        comments: 0,
        createdAt: new Date().toISOString(),
        workspaceId: taskData.workspaceId || this.workspaceId || null
      }
      
      console.log('New task created:', newTask)
      this.tasks.unshift(newTask)
      return newTask
    },

    setWorkspace(workspaceId: number | null) {
      this.workspaceId = workspaceId
      this.taskFilters = {
        status: null,
        priority: null,
        assignee: null
      }
    },

    updateFilters(filters: Partial<TaskState['taskFilters']>) {
      this.taskFilters = {
        ...this.taskFilters,
        ...filters
      }
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
      const task = this.tasks.find(t => t.id === taskId)
      if (!task) return false

      const validProgress = Math.min(Math.max(Math.round(progress), 0), 100)
      
      task.progress = validProgress
      task.status = this.determineStatus(validProgress)

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