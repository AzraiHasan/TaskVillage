// stores/useNotificationStore.ts
import { defineStore } from 'pinia'

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
  time: string
  read: boolean
}

interface NotificationState {
  notifications: Notification[]
  nextNotificationId: number
}

export const useNotificationStore = defineStore('notifications', {
  state: (): NotificationState => ({
    notifications: [],
    nextNotificationId: 1
  }),

  getters: {
    unreadCount: (state) => state.notifications.filter(n => !n.read).length,
    allNotifications: (state) => state.notifications.sort((a, b) => 
      new Date(b.time).getTime() - new Date(a.time).getTime()
    )
  },

  actions: {
    addNotification(notification: Omit<Notification, 'id' | 'time'>) {
      this.notifications.unshift({
        ...notification,
        id: this.nextNotificationId++,
        time: new Date().toISOString()
      })
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
    }
  },

  persist: true
})