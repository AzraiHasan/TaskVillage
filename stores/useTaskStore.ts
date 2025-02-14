// stores/useTaskStore.ts

import { defineStore } from 'pinia'

// Define the Task interface
interface Task {
  id: number
  title: string
  description: string
  type: 'public' | 'private'
  priority: 'low' | 'medium' | 'high'
  assignee: {
    name: string
    avatar: string
  }
  likes: number
  comments: number
  createdAt: string
}

// Define the store state interface
interface TaskState {
  tasks: Task[]
  nextId: number
}

export const useTaskStore = defineStore('tasks', {
  // State
  state: (): TaskState => ({
    tasks: [
      // Initial mock data
      {
        id: 1,
        title: "Update landing page design",
        description: "Implement new hero section",
        type: "public",
        priority: "high",
        assignee: {
          name: "Sarah Chen",
          avatar: "/placeholder-avatar.png"
        },
        likes: 12,
        comments: 5,
        createdAt: new Date().toISOString()
      }
    ],
    nextId: 2
  }),

  // Getters
  getters: {
    publicTasks: (state) => 
      state.tasks.filter(task => task.type === 'public'),
    
    privateTasks: (state) =>
      state.tasks.filter(task => task.type === 'private'),
    
    getTaskById: (state) => (id: number) =>
      state.tasks.find(task => task.id === id)
  },

  // Actions
  actions: {
    addTask(taskData: Partial<Task>) {
      const newTask: Task = {
        id: this.nextId++,
        title: taskData.title || '',
        description: taskData.description || '',
        type: taskData.type || 'public',
        priority: taskData.priority || 'medium',
        assignee: taskData.assignee || {
          name: 'Current User',
          avatar: '/placeholder-avatar.png'
        },
        likes: 0,
        comments: 0,
        createdAt: new Date().toISOString()
      }
      
      this.tasks.unshift(newTask) // Add to beginning of array
      return newTask
    },

    updateTask(id: number, updates: Partial<Task>) {
      const taskIndex = this.tasks.findIndex(task => task.id === id)
      if (taskIndex !== -1) {
        this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updates }
      }
    },

    toggleLike(id: number) {
      const task = this.tasks.find(task => task.id === id)
      if (task) {
        task.likes += 1
      }
    },

    incrementComments(id: number) {
      const task = this.tasks.find(task => task.id === id)
      if (task) {
        task.comments += 1
      }
    }
  },

  // Enable persistence
  persist: true
})