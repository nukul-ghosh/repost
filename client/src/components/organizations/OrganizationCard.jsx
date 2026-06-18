import { Link } from 'react-router-dom'

const OrganizationCard = ({ organization }) => {
  return (
    <Link
      to={`/organizations/${organization._id}`}
      className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
    >
      <div className="flex items-start gap-4">
        {/* Logo */}
        <div className="w-16 h-16 rounded bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-600 flex-shrink-0">
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

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition">
            {organization.name}
          </h3>

          {organization.tagline && (
            <p className="text-sm text-gray-600 mt-1">{organization.tagline}</p>
          )}

          {organization.description && (
            <p className="text-gray-600 mt-2 line-clamp-2">{organization.description}</p>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
            {organization.industry && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>{organization.industry}</span>
              </div>
            )}

            {organization.employeeCount > 0 && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>{organization.employeeCount} employees</span>
              </div>
            )}

            {organization.location && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>
                  {organization.location.city}, {organization.location.country}
                </span>
              </div>
            )}
          </div>

          {/* Tags/Specialties */}
          {organization.specialties && organization.specialties.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {organization.specialties.slice(0, 4).map((specialty, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                >
                  {specialty}
                </span>
              ))}
              {organization.specialties.length > 4 && (
                <span className="px-2 py-1 text-xs text-gray-500">
                  +{organization.specialties.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default OrganizationCard
