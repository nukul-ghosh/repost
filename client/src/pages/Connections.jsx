import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import ConnectionCard from '../components/connections/ConnectionCard'
import ConnectionRequestCard from '../components/connections/ConnectionRequestCard'
import {
  getUserConnections,
  getConnectionRequests,
  getSentRequests
} from '../services/connectionService'

const Connections = () => {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('connections')
  const [connections, setConnections] = useState([])
  const [requests, setRequests] = useState([])
  const [sentRequests, setSentRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchData()
  }, [activeTab, user])

  const fetchData = async () => {
    if (!user?.id) return

    try {
      setIsLoading(true)

      if (activeTab === 'connections') {
        const response = await getUserConnections(user.id)
        setConnections(response.connections || [])
      } else if (activeTab === 'requests') {
        const response = await getConnectionRequests()
        setRequests(response.requests || [])
      } else if (activeTab === 'sent') {
        const response = await getSentRequests()
        setSentRequests(response.requests || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredConnections = connections.filter((conn) => {
    const otherUser = conn.requester?._id === user?.id ? conn.recipient : conn.requester
    if (!otherUser) return false
    const fullName = `${otherUser.firstName} ${otherUser.lastName}`.toLowerCase()
    return fullName.includes(searchQuery.toLowerCase())
  })

  const tabs = [
    {
      id: 'connections',
      label: 'My Connections',
      count: connections.length
    },
    {
      id: 'requests',
      label: 'Requests',
      count: requests.filter((r) => r.status === 'pending').length
    },
    {
      id: 'sent',
      label: 'Sent',
      count: sentRequests.length
    }
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Connections</h1>
        <p className="text-gray-600">
          Manage your professional network and connection requests
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-6 py-4 text-center transition ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-600 text-blue-600 font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search Bar (only for connections tab) */}
        {activeTab === 'connections' && connections.length > 0 && (
          <div className="p-4 border-b border-gray-200">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search connections..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse"
            >
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'connections' ? (
        filteredConnections.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No connections found' : 'No connections yet'}
            </h3>
            <p className="text-gray-600">
              {searchQuery
                ? 'Try a different search term'
                : 'Start connecting with professionals in your field'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredConnections.map((connection) => (
              <ConnectionCard
                key={connection._id}
                connection={connection}
                onUpdate={fetchData}
              />
            ))}
          </div>
        )
      ) : activeTab === 'requests' ? (
        requests.filter((r) => r.status === 'pending').length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">📬</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No pending requests
            </h3>
            <p className="text-gray-600">
              You have no connection requests at the moment
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests
              .filter((r) => r.status === 'pending')
              .map((request) => (
                <ConnectionRequestCard
                  key={request._id}
                  request={request}
                  type="received"
                  onUpdate={fetchData}
                />
              ))}
          </div>
        )
      ) : (
        sentRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">📤</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No sent requests
            </h3>
            <p className="text-gray-600">
              You haven't sent any connection requests yet
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sentRequests.map((request) => (
              <ConnectionRequestCard
                key={request._id}
                request={request}
                type="sent"
                onUpdate={fetchData}
              />
            ))}
          </div>
        )
      )}
    </div>
  )
}

export default Connections
