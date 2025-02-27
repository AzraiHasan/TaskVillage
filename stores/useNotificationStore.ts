// stores/useNotificationStore.ts
import { defineStore } from 'pinia'

// Define notification categories
export type NotificationCategory = 'task_update' | 'comment' | 'mention' | 'assignment'

export interface Notification {
  id: number
  userId: string
  taskId?: number
  taskTitle?: string
  user: {
    name: string
    avatar: string
  }
  action: string
  category?: NotificationCategory // Add category for filtering
  time: string
  read: boolean
}

interface NotificationState {
  notifications: Notification[]
  nextNotificationId: number
  preferences: {
    enabledCategories: NotificationCategory[]
    emailNotifications: boolean
  }
}

export const useNotificationStore = defineStore('notifications', {
  state: (): NotificationState => ({
    notifications: [],
    nextNotificationId: 1,
    preferences: {
      enabledCategories: ['task_update', 'comment', 'mention', 'assignment'],
      emailNotifications: true
    }
  }),

  getters: {
    unreadCount: (state) => state.notifications.filter(n => !n.read).length,
    allNotifications: (state) => state.notifications.sort((a, b) => 
      new Date(b.time).getTime() - new Date(a.time).getTime()
    ),
    
    // Add new getters for filtering
    getByCategory: (state) => (category: NotificationCategory) => 
      state.notifications.filter(n => n.category === category),
    
    unreadByCategory: (state) => (category: NotificationCategory) => 
      state.notifications.filter(n => !n.read && n.category === category).length
  },

  actions: {
    addNotification(notification: Omit<Notification, 'id' | 'time' | 'category'>) {
      // Determine category based on action
      const category = this.determineCategoryFromAction(notification.action)
      
      // Only add notification if the category is enabled in preferences
      if (this.preferences.enabledCategories.includes(category)) {
        this.notifications.unshift({
          ...notification,
          id: this.nextNotificationId++,
          time: new Date().toISOString(),
          category
        })
      }
    },

    // Helper to determine notification category from action text
    determineCategoryFromAction(action: string): NotificationCategory {
      if (action.includes('comment')) return 'comment'
      if (action.includes('mentioned')) return 'mention'
      if (action.includes('assigned')) return 'assignment'
      return 'task_update' // Default for created, updated, completed, etc.
    },

    markAllAsRead() {
      this.notifications.forEach(notification => {
        notification.read = true
      })
    },

    markAsRead(notificationId: number) {
      const notification = this.notifications.find(n => n.id === notificationId)
      if (notification) {
        notification.read = true
      }
    },
    
    // Add new method to update notification preferences
    updatePreferences(preferences: Partial<NotificationState['preferences']>) {
      this.preferences = {
        ...this.preferences,
        ...preferences
      }
    },
    
    // Add method to clear notifications by category
    clearByCategory(category: NotificationCategory) {
      this.notifications = this.notifications.filter(n => n.category !== category)
    }
  },

  persist: true
})