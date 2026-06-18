import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import {
  getOrganizationById,
  deleteOrganization,
  addEmployee,
  approveEmployee,
  removeEmployee,
  addAdmin,
  removeAdmin,
  getOrganizationProjects
} from '../services/organizationService'
import ProjectCard from '../components/projects/ProjectCard'

const OrganizationDetail = () => {
  const { organizationId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [organization, setOrganization] = useState(null)
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('about')
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false)
  const [newEmployeeEmail, setNewEmployeeEmail] = useState('')
  const [newEmployeeRole, setNewEmployeeRole] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    fetchOrganization()
    if (activeTab === 'projects') {
      fetchProjects()
    }
  }, [organizationId, activeTab])

  const fetchOrganization = async () => {
    try {
      setIsLoading(true)
      const response = await getOrganizationById(organizationId)
      setOrganization(response.organization)
    } catch (error) {
      console.error('Error fetching organization:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchProjects = async () => {
    try {
      const response = await getOrganizationProjects(organizationId)
      setProjects(response.projects || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this organization? This action cannot be undone.')) return

    try {
      await deleteOrganization(organizationId)
      navigate('/organizations')
    } catch (error) {
      console.error('Error deleting organization:', error)
      alert(error.response?.data?.message || 'Failed to delete organization')
    }
  }

  const handleAddEmployee = async (e) => {
    e.preventDefault()
    if (!newEmployeeEmail || !newEmployeeRole) return

    try {
      setIsProcessing(true)
      await addEmployee(organizationId, {
        email: newEmployeeEmail,
        role: newEmployeeRole
      })
      setNewEmployeeEmail('')
      setNewEmployeeRole('')
      setShowAddEmployeeModal(false)
      fetchOrganization()
    } catch (error) {
      console.error('Error adding employee:', error)
      alert(error.response?.data?.message || 'Failed to add employee')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleApproveEmployee = async (userId) => {
    try {
      await approveEmployee(organizationId, userId)
      fetchOrganization()
    } catch (error) {
      console.error('Error approving employee:', error)
      alert(error.response?.data?.message || 'Failed to approve employee')
    }
  }

  const handleRemoveEmployee = async (userId) => {
    if (!confirm('Remove this employee from the organization?')) return

    try {
      await removeEmployee(organizationId, userId)
      fetchOrganization()
    } catch (error) {
      console.error('Error removing employee:', error)
      alert(error.response?.data?.message || 'Failed to remove employee')
    }
  }

  const handleMakeAdmin = async (userId) => {
    if (!confirm('Promote this employee to admin?')) return

    try {
      await addAdmin(organizationId, userId)
      fetchOrganization()
    } catch (error) {
      console.error('Error making admin:', error)
      alert(error.response?.data?.message || 'Failed to promote employee')
    }
  }

  const isAdmin = organization?.admins?.some((admin) => admin._id === user?.id)

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="w-24 h-24 bg-gray-200 rounded"></div>
            <div className="flex-1 space-y-3">
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Organization not found
          </h3>
          <p className="text-gray-600 mb-6">
            This organization may have been deleted or doesn't exist
          </p>
          <Link
            to="/organizations"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Browse Organizations
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4 flex-1">
            {/* Logo */}
            <div className="w-24 h-24 rounded bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-600 flex-shrink-0">
              {organization.logo?.url ? (
                <img
                  src={organization.logo.url}
                  alt={organization.name}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                organization.name[0]
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{organization.name}</h1>
              {organization.tagline && (
                <p className="text-lg text-gray-600 mb-2">{organization.tagline}</p>
              )}

              {/* Metadata */}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                {organization.industry && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {organization.industry}
                  </span>
                )}
                {organization.employeeCount > 0 && (
                  <span>{organization.employeeCount} employees</span>
                )}
                {organization.location && (
                  <span>
                    {organization.location.city}, {organization.location.country}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          {isAdmin && (
            <div className="flex gap-2">
              <Link
                to={`/organizations/${organizationId}/edit`}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Links */}
        {(organization.website || organization.linkedinUrl) && (
          <div className="flex gap-3 mt-4">
            {organization.website && (
              <a
                href={organization.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Website
              </a>
            )}
            {organization.linkedinUrl && (
              <a
                href={organization.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                LinkedIn
              </a>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          {[
            { id: 'about', label: 'About' },
            { id: 'employees', label: 'Employees' },
            { id: 'projects', label: 'Projects' }
          ].map((tab) => (
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
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* About Tab */}
        {activeTab === 'about' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
            {organization.description && (
              <p className="text-gray-700 mb-6 whitespace-pre-wrap">
                {organization.description}
              </p>
            )}

            {organization.specialties && organization.specialties.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {organization.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {organization.foundedYear && (
              <p className="text-sm text-gray-500">Founded: {organization.foundedYear}</p>
            )}
          </div>
        )}

        {/* Employees Tab */}
        {activeTab === 'employees' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Employees</h2>
              {isAdmin && (
                <button
                  onClick={() => setShowAddEmployeeModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Add Employee
                </button>
              )}
            </div>

            {organization.employees && organization.employees.length > 0 ? (
              <div className="space-y-4">
                {organization.employees.map((employee) => (
                  <div
                    key={employee._id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-600">
                        {employee.userId?.profilePicture ? (
                          <img
                            src={employee.userId.profilePicture}
                            alt={`${employee.userId.firstName} ${employee.userId.lastName}`}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          `${employee.userId?.firstName?.[0] || ''}${employee.userId?.lastName?.[0] || ''}`
                        )}
                      </div>
                      <div>
                        <Link
                          to={`/profile/${employee.userId?._id}`}
                          className="font-semibold text-gray-900 hover:text-blue-600"
                        >
                          {employee.userId?.firstName} {employee.userId?.lastName}
                        </Link>
                        <p className="text-sm text-gray-600">{employee.role}</p>
                        {employee.status === 'pending' && (
                          <span className="text-xs text-yellow-600">Pending approval</span>
                        )}
                        {organization.admins?.some((admin) => admin._id === employee.userId?._id) && (
                          <span className="text-xs text-blue-600 ml-2">Admin</span>
                        )}
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="flex gap-2">
                        {employee.status === 'pending' && (
                          <button
                            onClick={() => handleApproveEmployee(employee.userId._id)}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
                          >
                            Approve
                          </button>
                        )}
                        {!organization.admins?.some((admin) => admin._id === employee.userId?._id) && (
                          <button
                            onClick={() => handleMakeAdmin(employee.userId._id)}
                            className="px-3 py-1 text-sm border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition"
                          >
                            Make Admin
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveEmployee(employee.userId._id)}
                          className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No employees yet</p>
            )}
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Projects</h2>
            {projects.length > 0 ? (
              <div className="space-y-4">
                {projects.map((project) => (
                  <ProjectCard key={project._id} project={project} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No projects yet</p>
            )}
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      {showAddEmployeeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Employee</h3>
            <form onSubmit={handleAddEmployee}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newEmployeeEmail}
                    onChange={(e) => setNewEmployeeEmail(e.target.value)}
                    placeholder="employee@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    value={newEmployeeRole}
                    onChange={(e) => setNewEmployeeRole(e.target.value)}
                    placeholder="e.g., Software Engineer"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {isProcessing ? 'Adding...' : 'Add Employee'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddEmployeeModal(false)}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrganizationDetail
