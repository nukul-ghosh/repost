import api from './api'

// Get all projects with pagination and filters
export const getProjects = async (params = {}) => {
  const response = await api.get('/projects', { params })
  return response.data
}

// Get single project by ID
export const getProjectById = async (projectId) => {
  const response = await api.get(`/projects/${projectId}`)
  return response.data
}

// Create new project
export const createProject = async (projectData) => {
  const response = await api.post('/projects', projectData)
  return response.data
}

// Update project
export const updateProject = async (projectId, projectData) => {
  const response = await api.put(`/projects/${projectId}`, projectData)
  return response.data
}

// Delete project
export const deleteProject = async (projectId) => {
  const response = await api.delete(`/projects/${projectId}`)
  return response.data
}

// Add team member
export const addTeamMember = async (projectId, userData) => {
  const response = await api.post(`/projects/${projectId}/team`, userData)
  return response.data
}

// Approve team member
export const approveTeamMember = async (projectId, userId) => {
  const response = await api.put(`/projects/${projectId}/team/${userId}/approve`)
  return response.data
}

// Remove team member
export const removeTeamMember = async (projectId, userId) => {
  const response = await api.delete(`/projects/${projectId}/team/${userId}`)
  return response.data
}

// Claim project for organization
export const claimProject = async (projectId, organizationId) => {
  const response = await api.post(`/projects/${projectId}/claim`, { organizationId })
  return response.data
}

// Get user's projects
export const getUserProjects = async (userId) => {
  const response = await api.get(`/projects/user/${userId}`)
  return response.data
}

// Get organization's projects
export const getOrganizationProjects = async (organizationId) => {
  const response = await api.get(`/projects/organization/${organizationId}`)
  return response.data
}
