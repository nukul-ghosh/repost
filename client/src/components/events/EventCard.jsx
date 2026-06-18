import { useState } from 'react'
import { starEvent, unstarEvent } from '../../services/starService'
import { approveEvent, rejectEvent } from '../../services/eventService'

const EventCard = ({ event, isOwnProfile, onUpdate }) => {
  const [isStarred, setIsStarred] = useState(false)
  const [starCount, setStarCount] = useState(event.starsCount || 0)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const eventTypeConfig = {
    skill: { icon: '🎯', color: 'blue' },
    certification: { icon: '🏆', color: 'yellow' },
    achievement: { icon: '⭐', color: 'purple' },
    education: { icon: '🎓', color: 'green' },
    experience: { icon: '💼', color: 'indigo' },
    project: { icon: '🚀', color: 'pink' },
    endorsement: { icon: '👏', color: 'orange' }
  }

  const config = eventTypeConfig[event.eventType] || eventTypeConfig.skill

  const handleStar = async () => {
    try {
      if (isStarred) {
        await unstarEvent(event._id)
        setStarCount((prev) => prev - 1)
      } else {
        await starEvent(event._id)
        setStarCount((prev) => prev + 1)
      }
      setIsStarred(!isStarred)
    } catch (error) {
      console.error('Error starring event:', error)
    }
  }

  const handleApprove = async () => {
    try {
      await approveEvent(event._id)
      onUpdate?.()
    } catch (error) {
      console.error('Error approving event:', error)
    }
  }

  const handleReject = async () => {
    try {
      await rejectEvent(event._id, rejectReason)
      setShowRejectModal(false)
      onUpdate?.()
    } catch (error) {
      console.error('Error rejecting event:', error)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={`w-12 h-12 rounded-lg bg-${config.color}-100 flex items-center justify-center text-2xl`}
          >
            {config.icon}
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {event.title}
              </h3>
              {event.status === 'pending' && (
                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                  Pending
                </span>
              )}
            </div>

            <p className="text-sm text-gray-600 mt-1">
              {event.eventType.charAt(0).toUpperCase() +
                event.eventType.slice(1)}{' '}
              • {new Date(event.eventDate).toLocaleDateString()}
            </p>

            {event.addedBy && event.addedBy._id !== event.user && (
              <p className="text-xs text-gray-500 mt-1">
                Added by {event.addedBy.firstName} {event.addedBy.lastName}
              </p>
            )}
          </div>
        </div>

        {/* Star Button */}
        {event.status === 'approved' && (
          <button
            onClick={handleStar}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition ${
              isStarred
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <svg
              className="w-5 h-5"
              fill={isStarred ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
            <span className="text-sm font-medium">{starCount}</span>
          </button>
        )}
      </div>

      {/* Description */}
      {event.description && (
        <p className="text-gray-700 mb-4">{event.description}</p>
      )}

      {/* Tags */}
      {event.tags && event.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {event.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Skill Level */}
      {event.eventType === 'skill' && event.skillLevel && (
        <div className="text-sm text-gray-600 mb-4">
          Level: <span className="font-medium">{event.skillLevel}</span>
        </div>
      )}

      {/* Pending Actions */}
      {event.status === 'pending' && isOwnProfile && (
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          <button
            onClick={handleApprove}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Approve
          </button>
          <button
            onClick={() => setShowRejectModal(true)}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Reject
          </button>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Reject Event</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Reject
              </button>
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-200 text-sm text-gray-500">
        <span>{event.commentsCount || 0} comments</span>
        <span>•</span>
        <span>
          {event.weightedStarsScore
            ? `${event.weightedStarsScore.toFixed(1)} weighted score`
            : 'No stars yet'}
        </span>
      </div>
    </div>
  )
}

export default EventCard
