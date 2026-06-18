import { useState, useEffect } from 'react'
import NotificationItem from '../components/notifications/NotificationItem'
import {
  getNotifications,
  markAllAsRead,
  deleteReadNotifications
} from '../services/notificationService'

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all', 'unread', 'read'
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(0)

  useEffect(() => {
    fetchNotifications(true)
  }, [filter])

  const fetchNotifications = async (reset = false) => {
    try {
      setIsLoading(true)
      const currentPage = reset ? 0 : page
      const params = {
        limit: 20,
        skip: currentPage * 20
      }

      if (filter === 'unread') {
        params.isRead = false
      } else if (filter === 'read') {
        params.isRead = true
      }

      const response = await getNotifications(params)

      if (reset) {
        setNotifications(response.notifications)
      } else {
        setNotifications([...notifications, ...response.notifications])
      }

      setHasMore(response.pagination.hasMore)
      setPage(reset ? 1 : currentPage + 1)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      fetchNotifications(true)
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const handleDeleteRead = async () => {
    if (confirm('Delete all read notifications?')) {
      try {
        await deleteReadNotifications()
        fetchNotifications(true)
      } catch (error) {
        console.error('Error deleting read notifications:', error)
      }
    }
  }

  const handleUpdate = () => {
    fetchNotifications(true)
  }

  const filteredNotifications =
    filter === 'all'
      ? notifications
      : filter === 'unread'
      ? notifications.filter((n) => !n.isRead)
      : notifications.filter((n) => n.isRead)

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
        <p className="text-gray-600">
          {unreadCount > 0
            ? `You have ${unreadCount} unread notification${
                unreadCount > 1 ? 's' : ''
              }`
            : 'All caught up!'}
        </p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Filter Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'unread'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'read'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Read
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
              >
                Mark all read
              </button>
            )}
            {notifications.filter((n) => n.isRead).length > 0 && (
              <button
                onClick={handleDeleteRead}
                className="px-4 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
              >
                Clear read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {isLoading && page === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">🔔</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </h3>
          <p className="text-gray-600">
            {filter === 'unread'
              ? 'All caught up! You have no unread notifications.'
              : 'When you get notifications, they will appear here.'}
          </p>
        </div>
      ) : (
        <div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-100">
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onUpdate={handleUpdate}
              />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="mt-4 text-center">
              <button
                onClick={() => fetchNotifications(false)}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Notifications
