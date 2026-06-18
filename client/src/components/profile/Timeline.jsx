import { useState } from 'react'
import EventCard from '../events/EventCard'

const Timeline = ({ events, isOwnProfile, isLoading, onUpdate }) => {
  const [filter, setFilter] = useState('all')

  const eventTypes = [
    { value: 'all', label: 'All Events' },
    { value: 'skill', label: 'Skills' },
    { value: 'certification', label: 'Certifications' },
    { value: 'achievement', label: 'Achievements' },
    { value: 'education', label: 'Education' },
    { value: 'experience', label: 'Experience' },
    { value: 'project', label: 'Projects' }
  ]

  const filteredEvents =
    filter === 'all'
      ? events
      : events.filter((event) => event.eventType === filter)

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse"
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
    )
  }

  return (
    <div>
      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex flex-wrap gap-2">
          {eventTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setFilter(type.value)}
              className={`px-4 py-2 rounded-lg transition ${
                filter === type.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No events yet
          </h3>
          <p className="text-gray-600">
            {isOwnProfile
              ? 'Start building your professional timeline by adding events.'
              : 'This user has not added any events yet.'}
          </p>
          {isOwnProfile && (
            <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Add First Event
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              isOwnProfile={isOwnProfile}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Timeline
