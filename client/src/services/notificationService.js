import api from './api'

// Get notifications
export const getNotifications = async (params = {}) => {
  const response = await api.get('/notifications', { params })
  return response.data
}

// Get unread count
export const getUnreadCount = async () => {
  const response = await api.get('/notifications/unread-count')
  return response.data
}

// Mark as read
export const markAsRead = async (notificationId) => {
  const response = await api.put(`/notifications/${notificationId}/read`)
  return response.data
}

// Mark all as read
export const markAllAsRead = async () => {
  const response = await api.put('/notifications/read-all')
  return response.data
}

// Delete notification
export const deleteNotification = async (notificationId) => {
  const response = await api.delete(`/notifications/${notificationId}`)
  return response.data
}

// Delete all read notifications
export const deleteReadNotifications = async () => {
  const response = await api.delete('/notifications/read')
  return response.data
}

// Get notification preferences
export const getNotificationPreferences = async () => {
  const response = await api.get('/notifications/preferences')
  return response.data
}

// Update notification preferences
export const updateNotificationPreferences = async (preferences) => {
  const response = await api.put('/notifications/preferences', preferences)
  return response.data
}
