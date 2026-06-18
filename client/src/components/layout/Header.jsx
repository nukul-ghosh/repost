import { Link } from 'react-router-dom'
import { FaBell, FaUser, FaSignOutAlt } from 'react-icons/fa'
import { useAuthStore } from '../../store/authStore'

const Header = () => {
  const { user, logout } = useAuthStore()
  
  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary-600">
            RepuNet
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link
              to="/notifications"
              className="text-gray-600 hover:text-primary-600 transition-colors relative"
            >
              <FaBell size={20} />
              {/* Notification badge */}
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                3
              </span>
            </Link>
            
            <Link
              to={`/profile/${user?.id}`}
              className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                {user?.profilePicture?.url ? (
                  <img
                    src={user.profilePicture.url}
                    alt={user.fullName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <FaUser />
                )}
              </div>
              <span className="font-medium">{user?.firstName}</span>
            </Link>
            
            <button
              onClick={logout}
              className="text-gray-600 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <FaSignOutAlt size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
