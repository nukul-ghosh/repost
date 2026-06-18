import api from './api'

// Create event
export const createEvent = async (eventData) => {
  const response = await api.post('/events', eventData)
  return response.data
}

// Get user's timeline events
export const getUserEvents = async (userId, params = {}) => {
  const response = await api.get(`/events/user/${userId}`, { params })
  return response.data
}

// Get single event
export const getEvent = async (eventId) => {
  const response = await api.get(`/events/${eventId}`)
  return response.data
}

// Update event
export const updateEvent = async (eventId, eventData) => {
  const response = await api.put(`/events/${eventId}`, eventData)
  return response.data
}

// Delete event
export const deleteEvent = async (eventId) => {
  const response = await api.delete(`/events/${eventId}`)
  return response.data
}

// Approve event
export const approveEvent = async (eventId) => {
  const response = await api.post(`/events/${eventId}/approve`)
  return response.data
}

// Reject event
export const rejectEvent = async (eventId, reason) => {
  const response = await api.post(`/events/${eventId}/reject`, { reason })
  return response.data
}

// Get pending events
export const getPendingEvents = async () => {
  const response = await api.get('/events/pending')
  return response.data
}
