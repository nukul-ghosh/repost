import api from './api'

// Star an event
export const starEvent = async (eventId) => {
  const response = await api.post(`/stars/${eventId}`)
  return response.data
}

// Unstar an event
export const unstarEvent = async (eventId) => {
  const response = await api.delete(`/stars/${eventId}`)
  return response.data
}

// Check if user has starred an event
export const checkStarStatus = async (eventId) => {
  const response = await api.get(`/stars/${eventId}/check`)
  return response.data
}

// Get stars for an event
export const getEventStars = async (eventId, params = {}) => {
  const response = await api.get(`/stars/event/${eventId}`, { params })
  return response.data
}

// Get stars given by user
export const getStarsGiven = async (userId, params = {}) => {
  const response = await api.get(`/stars/user/${userId}/given`, { params })
  return response.data
}

// Get stars received by user
export const getStarsReceived = async (userId, params = {}) => {
  const response = await api.get(`/stars/user/${userId}/received`, { params })
  return response.data
}
