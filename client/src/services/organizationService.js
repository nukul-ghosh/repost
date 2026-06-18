import api from './api'

// Get all organizations with pagination and filters
export const getOrganizations = async (params = {}) => {
  const response = await api.get('/organizations', { params })
  return response.data
}

// Get single organization by ID
export const getOrganizationById = async (organizationId) => {
  const response = await api.get(`/organizations/${organizationId}`)
  return response.data
}

// Create new organization
export const createOrganization = async (organizationData) => {
  const response = await api.post('/organizations', organizationData)
  return response.data
}

// Update organization
export const updateOrganization = async (organizationId, organizationData) => {
  const response = await api.put(`/organizations/${organizationId}`, organizationData)
  return response.data
}

// Delete organization
export const deleteOrganization = async (organizationId) => {
  const response = await api.delete(`/organizations/${organizationId}`)
  return response.data
}

// Add admin
export const addAdmin = async (organizationId, userId) => {
  const response = await api.post(`/organizations/${organizationId}/admins`, { userId })
  return response.data
}

// Remove admin
export const removeAdmin = async (organizationId, userId) => {
  const response = await api.delete(`/organizations/${organizationId}/admins/${userId}`)
  return response.data
}

// Add employee
export const addEmployee = async (organizationId, userData) => {
  const response = await api.post(`/organizations/${organizationId}/employees`, userData)
  return response.data
}

// Approve employee
export const approveEmployee = async (organizationId, userId) => {
  const response = await api.put(`/organizations/${organizationId}/employees/${userId}/approve`)
  return response.data
}

// Remove employee
export const removeEmployee = async (organizationId, userId) => {
  const response = await api.delete(`/organizations/${organizationId}/employees/${userId}`)
  return response.data
}

// Get organization projects
export const getOrganizationProjects = async (organizationId) => {
  const response = await api.get(`/organizations/${organizationId}/projects`)
  return response.data
}

// Get organization employees
export const getOrganizationEmployees = async (organizationId) => {
  const response = await api.get(`/organizations/${organizationId}/employees`)
  return response.data
}
