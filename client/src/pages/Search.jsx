import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import SearchResultCard from '../components/search/SearchResultCard'
import {
  universalSearch,
  searchUsers,
  searchProjects,
  searchOrganizations
} from '../services/searchService'

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [activeTab, setActiveTab] = useState('all')
  const [results, setResults] = useState({ users: [], projects: [], organizations: [] })
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [filters, setFilters] = useState({
    location: '',
    skills: '',
    technologies: '',
    industry: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  const limit = 10

  useEffect(() => {
    const urlQuery = searchParams.get('q')
    if (urlQuery && urlQuery !== query) {
      setQuery(urlQuery)
      performSearch(urlQuery, activeTab, 1)
    }
  }, [searchParams])

  useEffect(() => {
    if (query.trim()) {
      const delayDebounceFn = setTimeout(() => {
        performSearch(query, activeTab, page)
      }, 300)

      return () => clearTimeout(delayDebounceFn)
    } else {
      setResults({ users: [], projects: [], organizations: [] })
      setTotalResults(0)
    }
  }, [query, activeTab, page, filters])

  const performSearch = async (searchQuery, type, currentPage) => {
    if (!searchQuery.trim()) return

    try {
      setIsLoading(true)

      const params = {
        page: currentPage,
        limit,
        ...filters
      }

      let response
      if (type === 'all') {
        response = await universalSearch(searchQuery, params)
        setResults({
          users: response.users || [],
          projects: response.projects || [],
          organizations: response.organizations || []
        })
        setTotalResults(
          (response.users?.length || 0) +
          (response.projects?.length || 0) +
          (response.organizations?.length || 0)
        )
      } else if (type === 'users') {
        response = await searchUsers(searchQuery, params)
        setResults({ users: response.users || [], projects: [], organizations: [] })
        setTotalResults(response.total || 0)
      } else if (type === 'projects') {
        response = await searchProjects(searchQuery, params)
        setResults({ users: [], projects: response.projects || [], organizations: [] })
        setTotalResults(response.total || 0)
      } else if (type === 'organizations') {
        response = await searchOrganizations(searchQuery, params)
        setResults({ users: [], projects: [], organizations: response.organizations || [] })
        setTotalResults(response.total || 0)
      }
    } catch (error) {
      console.error('Error searching:', error)
      setResults({ users: [], projects: [], organizations: [] })
      setTotalResults(0)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      setSearchParams({ q: query })
      setPage(1)
      performSearch(query, activeTab, 1)
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setPage(1)
  }

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }))
    setPage(1)
  }

  const clearFilters = () => {
    setFilters({
      location: '',
      skills: '',
      technologies: '',
      industry: ''
    })
    setPage(1)
  }

  const tabs = [
    {
      id: 'all',
      label: 'All',
      count: (results.users?.length || 0) + (results.projects?.length || 0) + (results.organizations?.length || 0)
    },
    {
      id: 'users',
      label: 'Users',
      count: results.users?.length || 0
    },
    {
      id: 'projects',
      label: 'Projects',
      count: results.projects?.length || 0
    },
    {
      id: 'organizations',
      label: 'Organizations',
      count: results.organizations?.length || 0
    }
  ]

  const hasActiveFilters = Object.values(filters).some((val) => val !== '')

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Search</h1>
        <p className="text-gray-600">
          Discover professionals, projects, and organizations
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for people, projects, or organizations..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Search
          </button>
        </div>
      </form>

      {/* Tabs and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 px-6 py-4 text-center transition ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-600 text-blue-600 font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
              {query && tab.count > 0 && (
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

        {/* Filter Toggle */}
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <svg
              className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            {showFilters ? 'Hide' : 'Show'} Filters
            {hasActiveFilters && (
              <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
                Active
              </span>
            )}
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="p-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  placeholder="City or country..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Skills Filter (for users) */}
              {(activeTab === 'all' || activeTab === 'users') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills
                  </label>
                  <input
                    type="text"
                    value={filters.skills}
                    onChange={(e) => handleFilterChange('skills', e.target.value)}
                    placeholder="e.g., JavaScript, Python..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Technologies Filter (for projects) */}
              {(activeTab === 'all' || activeTab === 'projects') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Technologies
                  </label>
                  <input
                    type="text"
                    value={filters.technologies}
                    onChange={(e) => handleFilterChange('technologies', e.target.value)}
                    placeholder="e.g., React, Node.js..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Industry Filter (for organizations) */}
              {(activeTab === 'all' || activeTab === 'organizations') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={filters.industry}
                    onChange={(e) => handleFilterChange('industry', e.target.value)}
                    placeholder="e.g., Technology, Finance..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : query && totalResults === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No results found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search or filters
          </p>
        </div>
      ) : !query ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">🔎</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Start searching
          </h3>
          <p className="text-gray-600">
            Enter a search term to find professionals, projects, and organizations
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Users Section */}
          {(activeTab === 'all' || activeTab === 'users') && results.users?.length > 0 && (
            <div>
              {activeTab === 'all' && (
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Users ({results.users.length})
                </h2>
              )}
              <div className="space-y-4">
                {results.users.map((user) => (
                  <SearchResultCard key={user._id} result={user} type="user" />
                ))}
              </div>
            </div>
          )}

          {/* Projects Section */}
          {(activeTab === 'all' || activeTab === 'projects') && results.projects?.length > 0 && (
            <div>
              {activeTab === 'all' && (
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Projects ({results.projects.length})
                </h2>
              )}
              <div className="space-y-4">
                {results.projects.map((project) => (
                  <SearchResultCard key={project._id} result={project} type="project" />
                ))}
              </div>
            </div>
          )}

          {/* Organizations Section */}
          {(activeTab === 'all' || activeTab === 'organizations') && results.organizations?.length > 0 && (
            <div>
              {activeTab === 'all' && (
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Organizations ({results.organizations.length})
                </h2>
              )}
              <div className="space-y-4">
                {results.organizations.map((org) => (
                  <SearchResultCard key={org._id} result={org} type="organization" />
                ))}
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalResults > limit && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-600">
                Page {page}
              </span>
              <button
                onClick={() => setPage((prev) => prev + 1)}
                disabled={
                  (activeTab === 'all' && totalResults < limit) ||
                  (activeTab !== 'all' && totalResults <= page * limit)
                }
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Search
