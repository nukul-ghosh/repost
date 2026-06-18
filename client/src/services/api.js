import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Send cookies with requests (required for httpOnly cookies)
})

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      // No need to remove token from localStorage since it's in httpOnly cookie
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
