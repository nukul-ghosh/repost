import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'

const ProfileHeader = ({ user, isOwnProfile }) => {
  const { user: currentUser } = useAuthStore()

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Cover Image */}
      <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>

      {/* Profile Content */}
      <div className="px-6 pb-6">
        {/* Avatar and Basic Info */}
        <div className="flex items-start justify-between -mt-16 mb-4">
          <div className="flex items-end gap-4">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center text-4xl font-bold text-gray-600">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                `${user.firstName[0]}${user.lastName[0]}`
              )}
            </div>

            {/* Name and Headline */}
            <div className="pb-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </h1>
              {user.headline && (
                <p className="text-gray-600 mt-1">{user.headline}</p>
              )}
              {user.location && (
                <p className="text-sm text-gray-500 mt-1">
                  {user.location.city}, {user.location.country}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {isOwnProfile ? (
            <button className="mt-20 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Edit Profile
            </button>
          ) : (
            <div className="mt-20 flex gap-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Connect
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                Message
              </button>
            </div>
          )}
        </div>

        {/* Bio */}
        {user.bio && (
          <div className="mb-4">
            <p className="text-gray-700">{user.bio}</p>
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-6 border-t border-gray-200 pt-4">
          <div>
            <span className="text-2xl font-bold text-gray-900">
              {user.connectionsCount || 0}
            </span>
            <span className="text-sm text-gray-600 ml-1">Connections</span>
          </div>
          <div>
            <span className="text-2xl font-bold text-gray-900">
              {user.eventsCount || 0}
            </span>
            <span className="text-sm text-gray-600 ml-1">Events</span>
          </div>
          <div>
            <span className="text-2xl font-bold text-gray-900">
              {user.projectsCount || 0}
            </span>
            <span className="text-sm text-gray-600 ml-1">Projects</span>
          </div>
        </div>

        {/* Website */}
        {user.website && (
          <div className="mt-4">
            <a
              href={user.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              {user.website}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfileHeader
