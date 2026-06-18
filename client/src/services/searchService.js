import api from './api'

// Universal search
export const universalSearch = async (query, params = {}) => {
  const response = await api.get('/search', { params: { q: query, ...params } })
  return response.data
}

// Search users
export const searchUsers = async (query, params = {}) => {
  const response = await api.get('/search/users', { params: { q: query, ...params } })
  return response.data
}

// Search projects
export const searchProjects = async (query, params = {}) => {
  const response = await api.get('/search/projects', { params: { q: query, ...params } })
  return response.data
}

// Search organizations
export const searchOrganizations = async (query, params = {}) => {
  const response = await api.get('/search/organizations', { params: { q: query, ...params } })
  return response.data
}

// Get skill suggestions (autocomplete)
export const suggestSkills = async (query, limit = 10) => {
  const response = await api.get('/search/skills', { params: { q: query, limit } })
  return response.data
}

// Get technology suggestions (autocomplete)
export const suggestTechnologies = async (query, limit = 10) => {
  const response = await api.get('/search/technologies', { params: { q: query, limit } })
  return response.data
}

// Advanced search
export const advancedSearch = async (query, type = 'all', filters = {}, params = {}) => {
  const response = await api.get('/search/advanced', {
    params: {
      q: query,
      type,
      filters: JSON.stringify(filters),
      ...params
    }
  })
  return response.data
}
