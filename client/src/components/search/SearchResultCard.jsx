import { Link } from 'react-router-dom'

const SearchResultCard = ({ result, type }) => {
  if (type === 'user') {
    return (
      <Link
        to={`/profile/${result._id}`}
        className="block bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition"
      >
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 flex-shrink-0">
            {result.profilePicture ? (
              <img
                src={result.profilePicture}
                alt={`${result.firstName} ${result.lastName}`}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              `${result.firstName[0]}${result.lastName[0]}`
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 hover:text-blue-600">
              {result.firstName} {result.lastName}
            </h3>
            {result.headline && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {result.headline}
              </p>
            )}
            {result.location && (
              <p className="text-xs text-gray-500 mt-1">
                {result.location.city}, {result.location.country}
              </p>
            )}
            {result.connectionsCount > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {result.connectionsCount} connections
              </p>
            )}
          </div>

          {/* Badge */}
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
            User
          </span>
        </div>
      </Link>
    )
  }

  if (type === 'project') {
    return (
      <Link
        to={`/projects/${result._id || result.slug}`}
        className="block bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 hover:text-blue-600">
              {result.title}
            </h3>
            {result.description && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {result.description}
              </p>
            )}

            {/* Technologies */}
            {result.technologies && result.technologies.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {result.technologies.slice(0, 5).map((tech, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded"
                  >
                    {tech}
                  </span>
                ))}
                {result.technologies.length > 5 && (
                  <span className="px-2 py-0.5 text-xs text-gray-500">
                    +{result.technologies.length - 5} more
                  </span>
                )}
              </div>
            )}

            {/* Creator */}
            {result.createdBy && (
              <p className="text-xs text-gray-500 mt-2">
                By {result.createdBy.firstName} {result.createdBy.lastName}
              </p>
            )}
          </div>

          {/* Badge */}
          <span className="px-2 py-1 text-xs bg-purple-100 text-purple-600 rounded-full ml-4">
            Project
          </span>
        </div>
      </Link>
    )
  }

  if (type === 'organization') {
    return (
      <Link
        to={`/organizations/${result._id || result.slug}`}
        className="block bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition"
      >
        <div className="flex items-start gap-3">
          {/* Logo */}
          <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 flex-shrink-0">
            {result.logo?.url ? (
              <img
                src={result.logo.url}
                alt={result.name}
                className="w-full h-full object-cover rounded"
              />
            ) : (
              result.name[0]
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 hover:text-blue-600">
              {result.name}
            </h3>
            {result.tagline && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {result.tagline}
              </p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
              {result.industry && <span>{result.industry}</span>}
              {result.employeeCount > 0 && (
                <>
                  <span>•</span>
                  <span>{result.employeeCount} employees</span>
                </>
              )}
            </div>
          </div>

          {/* Badge */}
          <span className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded-full">
            Organization
          </span>
        </div>
      </Link>
    )
  }

  return null
}

export default SearchResultCard
