// stores/useTaskStore.ts
import { defineStore } from 'pinia'
import { TaskVillageError, ErrorCode } from '~/types/errors'
import { useNotificationStore } from '~/stores/useNotificationStore'

// Maintain existing type constants
export const TASK_TYPES = ['public', 'private'] as const
export const PRIORITIES = ['low', 'medium', 'high'] as const
export const STATUSES = ['not_started', 'in_progress', 'in_review', 'completed', 'canceled'] as const

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
  isLoading: boolean
  lastError: TaskVillageError | null
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
    },
    isLoading: false,
    lastError: null
  }),

  getters: {
    publicTasks: (state): Task[] => 
  state.tasks.filter(task => 
    task.type === 'public' && 
    (task.workspaceId === state.workspaceId || task.workspaceId === null)
  ),

privateTasks: (state): Task[] =>
  state.tasks.filter(task => 
    task.type === 'private' && 
    (task.workspaceId === state.workspaceId || task.workspaceId === null)
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

    currentWorkspaceTasks: (state): Task[] => {
      if (!state.workspaceId) return []
      return state.tasks.filter(task => task.workspaceId === state.workspaceId)
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
      try {
        // Initialize with empty state
        this.tasks = []
        this.comments = []
        this.nextTaskId = 1
        this.nextCommentId = 1
        this.workspaceId = null
        this.taskFilters = {
          status: null,
          priority: null,
          assignee: null
        }
        this.isLoading = false
        this.lastError = null
        
        console.log('Store initialized successfully')
      } catch (error) {
        console.error('Failed to initialize store:', error)
        // Handle initialization error
        this.lastError = error instanceof TaskVillageError 
          ? error 
          : new TaskVillageError('Failed to initialize store', ErrorCode.OPERATION_FAILED)
      }
    },
    async createTask(taskData: Partial<Omit<Task, 'id' | 'likes' | 'likedBy' | 'comments' | 'createdAt'>>) {
      this.isLoading = true
      this.lastError = null

      try {
        if (!taskData.title?.trim()) {
          throw new TaskVillageError('Task title is required', ErrorCode.INVALID_INPUT)
        }

        const workspaceId = taskData.workspaceId || this.workspaceId
        if (!workspaceId) {
          throw new TaskVillageError('Workspace is required', ErrorCode.INVALID_INPUT)
        }

        const { hasWorkspaceAccess } = useUser()
        if (!hasWorkspaceAccess(workspaceId)) {
          throw new TaskVillageError('No access to workspace', ErrorCode.WORKSPACE_ACCESS_DENIED)
        }

        const newTask: Task = {
          id: this.nextTaskId++,
          title: taskData.title,
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
          workspaceId
        }
        
        this.tasks.unshift(newTask)
        return newTask
      } catch (error) {
        this.lastError = error instanceof TaskVillageError 
          ? error 
          : new TaskVillageError('Failed to create task', ErrorCode.OPERATION_FAILED)
        throw this.lastError
      } finally {
        this.isLoading = false
      }
    },

    setWorkspace(workspaceId: number | null) {
      try {
        if (workspaceId) {
          const { hasWorkspaceAccess } = useUser()
          if (!hasWorkspaceAccess(workspaceId)) {
            throw new TaskVillageError('No access to workspace', ErrorCode.WORKSPACE_ACCESS_DENIED)
          }
        }
        this.workspaceId = workspaceId
        this.taskFilters = {
          status: null,
          priority: null,
          assignee: null
        }
      } catch (error) {
        this.lastError = error instanceof TaskVillageError 
          ? error 
          : new TaskVillageError('Failed to set workspace', ErrorCode.OPERATION_FAILED)
        throw this.lastError
      }
    },

    determineStatus(progress: number): Status {
  if (progress === 0) {
    return 'not_started';
  } else if (progress < 100) {
    return 'in_progress';
  } else {
    return 'completed';
  }
},

    async updateTaskProgress(taskId: number, progress: number): Promise<boolean> {
      this.isLoading = true
      this.lastError = null

      try {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId)
        if (taskIndex === -1) {
          throw new TaskVillageError('Task not found', ErrorCode.TASK_NOT_FOUND)
        }

        if (progress < 0 || progress > 100) {
          throw new TaskVillageError('Invalid progress value', ErrorCode.INVALID_INPUT)
        }

        const task = this.tasks[taskIndex]
        
        const { hasWorkspaceAccess } = useUser()
        if (task.workspaceId !== null && !hasWorkspaceAccess(task.workspaceId)) {
          throw new TaskVillageError('No access to modify task', ErrorCode.WORKSPACE_ACCESS_DENIED)
        }

        this.tasks[taskIndex] = {
          ...task,
          progress: Math.round(progress),
          status: (this as any).determineStatus(progress)
        }

        return true
      } catch (error) {
        this.lastError = error instanceof TaskVillageError 
          ? error 
          : new TaskVillageError('Failed to update progress', ErrorCode.OPERATION_FAILED)
        throw this.lastError
      } finally {
        this.isLoading = false
      }
    },

    toggleLike(taskId: number, userId: string): void {
      try {
        const task = this.tasks.find(t => t.id === taskId)
        if (!task) {
          throw new TaskVillageError('Task not found', ErrorCode.TASK_NOT_FOUND)
        }

        const { hasWorkspaceAccess } = useUser()
        if (task.workspaceId !== null && !hasWorkspaceAccess(task.workspaceId)) {
          throw new TaskVillageError('No access to interact with task', ErrorCode.WORKSPACE_ACCESS_DENIED)
        }

        const isLiked = task.likedBy.includes(userId)
        if (isLiked) {
          task.likedBy = task.likedBy.filter(id => id !== userId)
          task.likes = Math.max(0, task.likes - 1)
        } else {
          task.likedBy.push(userId)
          task.likes++
        }
      } catch (error) {
        this.lastError = error instanceof TaskVillageError 
          ? error 
          : new TaskVillageError('Failed to toggle like', ErrorCode.OPERATION_FAILED)
        throw this.lastError
      }
    },

    addComment(taskId: number, content: string, author: { name: string, avatar: string }): Comment {
      try {
        const task = this.tasks.find(t => t.id === taskId)
        if (!task) {
          throw new TaskVillageError('Task not found', ErrorCode.TASK_NOT_FOUND)
        }

        const { hasWorkspaceAccess } = useUser()
        if (task.workspaceId !== null && !hasWorkspaceAccess(task.workspaceId)) {
          throw new TaskVillageError('No access to comment on task', ErrorCode.WORKSPACE_ACCESS_DENIED)
        }

        const newComment: Comment = {
          id: this.nextCommentId++,
          taskId,
          taskType: task.type,
          content: content.trim(),
          author,
          createdAt: new Date().toISOString()
        }

        this.comments.push(newComment)
        task.comments++

        return newComment
      } catch (error) {
        this.lastError = error instanceof TaskVillageError 
          ? error 
          : new TaskVillageError('Failed to add comment', ErrorCode.OPERATION_FAILED)
        throw this.lastError
      }
    },
    async completeTask(taskId: number): Promise<boolean> {
      this.isLoading = true
      this.lastError = null

      try {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId)
        if (taskIndex === -1) {
          throw new TaskVillageError('Task not found', ErrorCode.TASK_NOT_FOUND)
        }

        const task = this.tasks[taskIndex]
        
        const { hasWorkspaceAccess } = useUser()
        if (task.workspaceId !== null && !hasWorkspaceAccess(task.workspaceId)) {
          throw new TaskVillageError('No access to modify task', ErrorCode.WORKSPACE_ACCESS_DENIED)
        }

        this.tasks[taskIndex] = {
          ...task,
          status: 'completed',
          progress: 100
        }

        const notificationStore = useNotificationStore()
const { user } = useUser()

notificationStore.addNotification({
  userId: 'all', // Notify all team members
  taskId: task.id,
  taskTitle: task.title,
  user: {
    name: user.value?.name || 'Current User',
    avatar: user.value?.avatar || '/placeholder-avatar.png'
  },
  action: 'completed a task',
  read: false
})

        return true
      } catch (error) {
        this.lastError = error instanceof TaskVillageError 
          ? error 
          : new TaskVillageError('Failed to complete task', ErrorCode.OPERATION_FAILED)
        throw this.lastError
      } finally {
        this.isLoading = false
      }
    },

    async cancelTask(taskId: number, reason?: string): Promise<boolean> {
      this.isLoading = true
      this.lastError = null

      try {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId)
        if (taskIndex === -1) {
          throw new TaskVillageError('Task not found', ErrorCode.TASK_NOT_FOUND)
        }

        const task = this.tasks[taskIndex]
        
        const { hasWorkspaceAccess } = useUser()
        if (task.workspaceId !== null && !hasWorkspaceAccess(task.workspaceId)) {
          throw new TaskVillageError('No access to modify task', ErrorCode.WORKSPACE_ACCESS_DENIED)
        }

        // We'll add a new status for canceled tasks
        this.tasks[taskIndex] = {
          ...task,
          status: 'canceled' as Status, // We'll need to add this to the STATUSES array
          progress: 0,
          description: reason ? `${task.description}\n\nCanceled: ${reason}` : task.description
        }

        const notificationStore = useNotificationStore()
const { user } = useUser()

notificationStore.addNotification({
  userId: 'all',
  taskId: task.id,
  taskTitle: task.title,
  user: {
    name: user.value?.name || 'Current User',
    avatar: user.value?.avatar || '/placeholder-avatar.png'
  },
  action: 'canceled a task',
  read: false
})

        return true
      } catch (error) {
        this.lastError = error instanceof TaskVillageError 
          ? error 
          : new TaskVillageError('Failed to cancel task', ErrorCode.OPERATION_FAILED)
        throw this.lastError
      } finally {
        this.isLoading = false
      }
    },

    async updateTask(taskId: number, updateData: Partial<Omit<Task, 'id' | 'createdAt' | 'likes' | 'likedBy' | 'comments'>>): Promise<boolean> {
      this.isLoading = true
      this.lastError = null

      try {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId)
        if (taskIndex === -1) {
          throw new TaskVillageError('Task not found', ErrorCode.TASK_NOT_FOUND)
        }

        const task = this.tasks[taskIndex]
        
        const { hasWorkspaceAccess } = useUser()
        if (task.workspaceId !== null && !hasWorkspaceAccess(task.workspaceId)) {
          throw new TaskVillageError('No access to modify task', ErrorCode.WORKSPACE_ACCESS_DENIED)
        }

        // Update the task with new data
        this.tasks[taskIndex] = {
          ...task,
          ...updateData
        }

        const notificationStore = useNotificationStore()
const { user } = useUser()

notificationStore.addNotification({
  userId: 'all',
  taskId: task.id,
  taskTitle: task.title,
  user: {
    name: user.value?.name || 'Current User',
    avatar: user.value?.avatar || '/placeholder-avatar.png'
  },
  action: 'updated a task',
  read: false
})

        return true
      } catch (error) {
        this.lastError = error instanceof TaskVillageError 
          ? error 
          : new TaskVillageError('Failed to update task', ErrorCode.OPERATION_FAILED)
        throw this.lastError
      } finally {
        this.isLoading = false
      }
    }
    
  },

  persist: true
})

useTaskStore.prototype.determineStatus = function(progress: number): Status {
  if (progress === 100) return 'completed'
  if (progress > 0) return 'in_progress'
  return 'not_started'
}

export type TaskStore = ReturnType<typeof useTaskStore>