import api from './api'

// Get user profile
export const getUserProfile = async (userId) => {
  const response = await api.get(`/users/${userId}`)
  return response.data
}

// Update user profile
export const updateProfile = async (profileData) => {
  const response = await api.put('/auth/update-profile', profileData)
  return response.data
}

// Change password
export const changePassword = async (passwordData) => {
  const response = await api.put('/auth/change-password', passwordData)
  return response.data
}

// Update privacy settings
export const updatePrivacySettings = async (privacyData) => {
  const response = await api.put('/auth/privacy-settings', privacyData)
  return response.data
}

// Delete account
export const deleteAccount = async () => {
  const response = await api.delete('/auth/account')
  return response.data
}
