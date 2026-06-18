import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  acceptConnectionRequest,
  rejectConnectionRequest
} from '../../services/connectionService'

const ConnectionRequestCard = ({ request, type = 'received', onUpdate }) => {
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleAccept = async () => {
    try {
      setIsProcessing(true)
      await acceptConnectionRequest(request._id)
      onUpdate?.()
    } catch (error) {
      console.error('Error accepting request:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    try {
      setIsProcessing(true)
      await rejectConnectionRequest(request._id, rejectReason)
      setShowRejectModal(false)
      onUpdate?.()
    } catch (error) {
      console.error('Error rejecting request:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  // For received requests, show requester; for sent requests, show recipient
  const otherUser = type === 'received' ? request.requester : request.recipient

  if (!otherUser) return null

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
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

            {/* Message */}
            {request.message && (
              <p className="text-sm text-gray-700 mt-2 italic">
                "{request.message}"
              </p>
            )}

            {/* Request Date */}
            <p className="text-xs text-gray-500 mt-2">
              {type === 'received' ? 'Received' : 'Sent'}{' '}
              {new Date(request.createdAt).toLocaleDateString()}
            </p>
          </div>
        </Link>
      </div>

      {/* Actions */}
      {type === 'received' && request.status === 'pending' && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleAccept}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Accept'}
          </button>
          <button
            onClick={() => setShowRejectModal(true)}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            Decline
          </button>
        </div>
      )}

      {type === 'sent' && (
        <div className="mt-4">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
              request.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : request.status === 'accepted'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {request.status === 'pending'
              ? 'Pending'
              : request.status === 'accepted'
              ? 'Accepted'
              : 'Declined'}
          </span>
        </div>
      )}

      {/* Rejection Reason */}
      {request.status === 'rejected' && request.rejectionReason && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <span className="font-medium">Reason:</span> {request.rejectionReason}
          </p>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Decline Connection Request</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for declining (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleReject}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Decline'}
              </button>
              <button
                onClick={() => setShowRejectModal(false)}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ConnectionRequestCard
