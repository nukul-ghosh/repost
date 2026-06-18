import { Link } from 'react-router-dom'
import { removeConnection } from '../../services/connectionService'

const ConnectionCard = ({ connection, onUpdate }) => {
  const handleRemove = async () => {
    if (confirm('Remove this connection?')) {
      try {
        await removeConnection(connection._id)
        onUpdate?.()
      } catch (error) {
        console.error('Error removing connection:', error)
      }
    }
  }

  // Determine which user to display (the other person in the connection)
  const otherUser = connection.requester?._id === connection._id
    ? connection.recipient
    : connection.requester

  if (!otherUser) return null

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <Link
          to={`/profile/${otherUser._id}`}
          className="flex items-start gap-3 flex-1"
        >
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-600 flex-shrink-0">
            {otherUser.profilePicture ? (
              <img
                src={otherUser.profilePicture}
                alt={`${otherUser.firstName} ${otherUser.lastName}`}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              `${otherUser.firstName[0]}${otherUser.lastName[0]}`
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition">
              {otherUser.firstName} {otherUser.lastName}
            </h3>
            {otherUser.headline && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {otherUser.headline}
              </p>
            )}
            {otherUser.location && (
              <p className="text-xs text-gray-500 mt-1">
                {otherUser.location.city}, {otherUser.location.country}
              </p>
            )}

            {/* Mutual Connections */}
            {connection.mutualConnectionsCount > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                {connection.mutualConnectionsCount} mutual connection
                {connection.mutualConnectionsCount > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </Link>

        {/* Actions */}
        <div className="flex gap-2 ml-4">
          <Link
            to={`/profile/${otherUser._id}`}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            View Profile
          </Link>
          <button
            onClick={handleRemove}
            className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Connected Date */}
      <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
        Connected on {new Date(connection.createdAt).toLocaleDateString()}
      </div>
    </div>
  )
}

export default ConnectionCard
