import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      // Login
      login: async (email, password) => {
        try {
          const response = await api.post('/auth/login', { email, password })
          const { user } = response.data
          // Token is now in httpOnly cookie, not returned in response

          set({ user, isAuthenticated: true })

          return { success: true }
        } catch (error) {
          return {
            success: false,
            message: error.response?.data?.message || 'Login failed'
          }
        }
      },

      // Register
      register: async (userData) => {
        try {
          const response = await api.post('/auth/register', userData)
          const { user } = response.data
          // Token is now in httpOnly cookie, not returned in response

          set({ user, isAuthenticated: true })

          return { success: true }
        } catch (error) {
          return {
            success: false,
            message: error.response?.data?.message || 'Registration failed'
          }
        }
      },

      // Logout
      logout: async () => {
        try {
          // Call backend to clear httpOnly cookie
          await api.post('/auth/logout')
        } catch (error) {
          // Clear local state even if API call fails
          console.error('Logout error:', error)
        } finally {
          set({ user: null, isAuthenticated: false })
        }
      },

      // Update user
      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData }
        }))
      },

      // Check auth status
      checkAuth: async () => {
        try {
          // Try to fetch user with cookie
          const response = await api.get('/auth/me')
          set({
            user: response.data.user,
            isAuthenticated: true
          })
          return true
        } catch (error) {
          // Cookie invalid or expired
          set({ isAuthenticated: false, user: null })
          return false
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
        // Note: No longer storing token in localStorage
      })
    }
  )
)
