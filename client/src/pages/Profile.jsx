import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import ProfileHeader from '../components/profile/ProfileHeader'
import Timeline from '../components/profile/Timeline'
import { getUserEvents } from '../services/eventService'
import api from '../services/api'

const Profile = () => {
  const { userId } = useParams()
  const { user: currentUser } = useAuthStore()
  const [user, setUser] = useState(null)
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Determine if viewing own profile
  const isOwnProfile = !userId || userId === currentUser?.id

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Get user profile
        const targetUserId = userId || currentUser?.id
        if (!targetUserId) {
          throw new Error('User ID not found')
        }

        const userResponse = await api.get(`/users/${targetUserId}`)
        setUser(userResponse.data.user)

        // Get user's events
        const eventsResponse = await getUserEvents(targetUserId)
        setEvents(eventsResponse.events || [])
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError(err.response?.data?.message || 'Failed to load profile')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [userId, currentUser])

  const handleEventUpdate = () => {
    // Refresh events when one is updated
    const targetUserId = userId || currentUser?.id
    getUserEvents(targetUserId).then((response) => {
      setEvents(response.events || [])
    })
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          {/* Header Skeleton */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="h-32 bg-gray-200"></div>
            <div className="px-6 pb-6">
              <div className="flex items-start justify-between -mt-16 mb-4">
                <div className="flex items-end gap-4">
                  <div className="w-32 h-32 rounded-full bg-gray-300 border-4 border-white"></div>
                  <div className="pb-2 space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-48"></div>
                    <div className="h-4 bg-gray-200 rounded w-64"></div>
                  </div>
                </div>
              </div>
              <div className="h-20 bg-gray-200 rounded mb-4"></div>
              <div className="flex gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 bg-gray-200 rounded w-24"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-4xl mb-2">⚠️</div>
          <h2 className="text-xl font-semibold text-red-900 mb-2">
            Error Loading Profile
          </h2>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">👤</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            User Not Found
          </h2>
          <p className="text-gray-600">
            The user you're looking for doesn't exist.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="mb-6">
        <ProfileHeader user={user} isOwnProfile={isOwnProfile} />
      </div>

      {/* Add Event Button (for own profile) */}
      {isOwnProfile && (
        <div className="mb-6">
          <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Timeline Event
          </button>
        </div>
      )}

      {/* Timeline */}
      <Timeline
        events={events}
        isOwnProfile={isOwnProfile}
        isLoading={false}
        onUpdate={handleEventUpdate}
      />
    </div>
  )
}

export default Profile
