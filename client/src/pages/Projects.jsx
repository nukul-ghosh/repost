import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import ProjectCard from '../components/projects/ProjectCard'
import { getProjects, getUserProjects, deleteProject } from '../services/projectService'

const Projects = () => {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('all')
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    search: '',
    technologies: '',
    visibility: ''
  })

  const limit = 12

  useEffect(() => {
    fetchProjects()
  }, [activeTab, page, filters])

  const fetchProjects = async () => {
    try {
      setIsLoading(true)

      let response
      if (activeTab === 'all') {
        response = await getProjects({
          page,
          limit,
          search: filters.search,
          technologies: filters.technologies,
          visibility: filters.visibility
        })
      } else if (activeTab === 'my-projects' && user?.id) {
        response = await getUserProjects(user.id)
      }

      setProjects(response.projects || [])
      setTotalPages(response.totalPages || 1)
    } catch (error) {
      console.error('Error fetching projects:', error)
      setProjects([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (projectId) => {
    if (!confirm('Delete this project? This action cannot be undone.')) return

    try {
      await deleteProject(projectId)
      fetchProjects()
    } catch (error) {
      console.error('Error deleting project:', error)
      alert(error.response?.data?.message || 'Failed to delete project')
    }
  }

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }))
    setPage(1)
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      technologies: '',
      visibility: ''
    })
    setPage(1)
  }

  const tabs = [
    { id: 'all', label: 'All Projects' },
    { id: 'my-projects', label: 'My Projects', requiresAuth: true }
  ]

  const hasActiveFilters = Object.values(filters).some((val) => val !== '')

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Projects</h1>
          <p className="text-gray-600">
            Discover collaborative projects and showcase your work
          </p>
        </div>

        {user && (
          <Link
            to="/projects/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Create Project
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => {
            if (tab.requiresAuth && !user) return null

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setPage(1)
                }}
                className={`px-6 py-4 text-center transition ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600 font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Filters (only for "All Projects" tab) */}
        {activeTab === 'all' && (
          <div className="p-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Project title or description..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Technologies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Technologies
                </label>
                <input
                  type="text"
                  value={filters.technologies}
                  onChange={(e) => handleFilterChange('technologies', e.target.value)}
                  placeholder="e.g., React, Python..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Visibility */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visibility
                </label>
                <select
                  value={filters.visibility}
                  onChange={(e) => handleFilterChange('visibility', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All</option>
                  <option value="public">Public</option>
                  <option value="connectionsOnly">Connections Only</option>
                  <option value="teamOnly">Team Only</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-sm text-blue-600 hover:text-blue-700"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse"
            >
              <div className="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
              <div className="flex gap-2 mt-4">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {activeTab === 'my-projects' ? 'No projects yet' : 'No projects found'}
          </h3>
          <p className="text-gray-600 mb-6">
            {activeTab === 'my-projects'
              ? 'Start showcasing your work by creating your first project'
              : hasActiveFilters
              ? 'Try adjusting your filters'
              : 'Be the first to create a project'}
          </p>
          {user && activeTab === 'my-projects' && (
            <Link
              to="/projects/new"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Create Your First Project
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                showActions={activeTab === 'my-projects'}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Projects
