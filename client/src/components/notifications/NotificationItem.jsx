import { Link } from 'react-router-dom'
import { markAsRead, deleteNotification } from '../../services/notificationService'

const NotificationItem = ({ notification, onUpdate }) => {
  const handleMarkAsRead = async () => {
    if (!notification.isRead) {
      try {
        await markAsRead(notification._id)
        onUpdate?.()
      } catch (error) {
        console.error('Error marking notification as read:', error)
      }
    }
  }

  const handleDelete = async (e) => {
    e.stopPropagation()
    try {
      await deleteNotification(notification._id)
      onUpdate?.()
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const notificationTypeConfig = {
    connectionRequest: { icon: '🤝', color: 'blue' },
    connectionAccepted: { icon: '✅', color: 'green' },
    eventSubmitted: { icon: '📝', color: 'purple' },
    eventApproved: { icon: '✨', color: 'green' },
    eventRejected: { icon: '❌', color: 'red' },
    eventStarred: { icon: '⭐', color: 'yellow' },
    eventCommented: { icon: '💬', color: 'blue' },
    projectInvite: { icon: '🚀', color: 'indigo' },
    projectAccepted: { icon: '🎉', color: 'green' },
    projectRejected: { icon: '🚫', color: 'red' },
    newWatcher: { icon: '👀', color: 'purple' }
  }

  const config = notificationTypeConfig[notification.type] || {
    icon: '📢',
    color: 'gray'
  }

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    let interval = seconds / 31536000

    if (interval > 1) return Math.floor(interval) + 'y ago'
    interval = seconds / 2592000
    if (interval > 1) return Math.floor(interval) + 'mo ago'
    interval = seconds / 86400
    if (interval > 1) return Math.floor(interval) + 'd ago'
    interval = seconds / 3600
    if (interval > 1) return Math.floor(interval) + 'h ago'
    interval = seconds / 60
    if (interval > 1) return Math.floor(interval) + 'm ago'
    return 'Just now'
  }

  return (
    <div
      onClick={handleMarkAsRead}
      className={`flex items-start gap-3 p-4 rounded-lg transition cursor-pointer ${
        notification.isRead
          ? 'bg-white hover:bg-gray-50'
          : 'bg-blue-50 hover:bg-blue-100'
      }`}
    >
      {/* Icon */}
      <div
        className={`w-10 h-10 rounded-full bg-${config.color}-100 flex items-center justify-center text-lg flex-shrink-0`}
      >
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Sender Info */}
        {notification.sender && (
          <div className="flex items-center gap-2 mb-1">
            {notification.sender.profilePicture ? (
              <img
                src={notification.sender.profilePicture}
                alt={`${notification.sender.firstName} ${notification.sender.lastName}`}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                {notification.sender.firstName[0]}
              </div>
            )}
            <Link
              to={`/profile/${notification.sender._id}`}
              className="font-medium text-gray-900 hover:underline"
            >
              {notification.sender.firstName} {notification.sender.lastName}
            </Link>
          </div>
        )}

        {/* Message */}
        <p className="text-sm text-gray-700 mb-1">{notification.message}</p>

        {/* Time */}
        <p className="text-xs text-gray-500">{getTimeAgo(notification.createdAt)}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {!notification.isRead && (
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
        )}
        <button
          onClick={handleDelete}
          className="text-gray-400 hover:text-red-600 transition"
          title="Delete"
        >
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default NotificationItem
