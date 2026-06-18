import { NavLink } from 'react-router-dom'
import {
  FaHome,
  FaUser,
  FaUsers,
  FaSearch,
  FaProjectDiagram,
  FaBuilding,
  FaCog
} from 'react-icons/fa'
import { useAuthStore } from '../../store/authStore'

const Sidebar = () => {
  const { user } = useAuthStore()
  
  const navItems = [
    { to: `/profile/${user?.id}`, icon: FaHome, label: 'My Profile' },
    { to: `/timeline/${user?.id}`, icon: FaUser, label: 'Timeline' },
    { to: '/connections', icon: FaUsers, label: 'Connections' },
    { to: '/search', icon: FaSearch, label: 'Search' },
    { to: '/projects', icon: FaProjectDiagram, label: 'Projects' },
    { to: '/organizations', icon: FaBuilding, label: 'Organizations' },
    { to: '/settings', icon: FaCog, label: 'Settings' }
  ]
  
  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white shadow-md">
      <nav className="p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
