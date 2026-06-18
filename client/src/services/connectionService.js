import api from './api'

// Send connection request
export const sendConnectionRequest = async (userId, message) => {
  const response = await api.post('/connections/request', { recipientId: userId, message })
  return response.data
}

// Get connection requests (received)
export const getConnectionRequests = async (params = {}) => {
  const response = await api.get('/connections/requests', { params })
  return response.data
}

// Get sent connection requests
export const getSentRequests = async (params = {}) => {
  const response = await api.get('/connections/sent', { params })
  return response.data
}

// Accept connection request
export const acceptConnectionRequest = async (connectionId) => {
  const response = await api.put(`/connections/${connectionId}/accept`)
  return response.data
}

// Reject connection request
export const rejectConnectionRequest = async (connectionId, reason) => {
  const response = await api.put(`/connections/${connectionId}/reject`, { reason })
  return response.data
}

// Get user's connections
export const getUserConnections = async (userId, params = {}) => {
  const response = await api.get(`/connections/user/${userId}`, { params })
  return response.data
}

// Get mutual connections
export const getMutualConnections = async (userId, params = {}) => {
  const response = await api.get(`/connections/mutual/${userId}`, { params })
  return response.data
}

// Remove connection
export const removeConnection = async (connectionId) => {
  const response = await api.delete(`/connections/${connectionId}`)
  return response.data
}

// Watch/follow user
export const watchUser = async (userId) => {
  const response = await api.post(`/connections/watch/${userId}`)
  return response.data
}

// Unwatch user
export const unwatchUser = async (userId) => {
  const response = await api.delete(`/connections/watch/${userId}`)
  return response.data
}

// Get watchers (followers)
export const getWatchers = async (userId, params = {}) => {
  const response = await api.get(`/connections/watchers/${userId}`, { params })
  return response.data
}

// Get watching (following)
export const getWatching = async (userId, params = {}) => {
  const response = await api.get(`/connections/watching/${userId}`, { params })
  return response.data
}
