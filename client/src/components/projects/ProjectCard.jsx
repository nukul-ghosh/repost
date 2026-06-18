import { Link } from 'react-router-dom'

const ProjectCard = ({ project, showActions = false, onDelete, onEdit }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <Link
            to={`/projects/${project._id}`}
            className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition"
          >
            {project.title}
          </Link>

          {/* Organization Badge */}
          {project.organizationId && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-500">by</span>
              <Link
                to={`/organizations/${project.organizationId._id || project.organizationId}`}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {project.organizationId.name || 'Organization'}
              </Link>
            </div>
          )}

          {/* Description */}
          {project.description && (
            <p className="text-gray-600 mt-3 line-clamp-3">
              {project.description}
            </p>
          )}

          {/* Technologies */}
          {project.technologies && project.technologies.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {project.technologies.slice(0, 6).map((tech, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded"
                >
                  {tech}
                </span>
              ))}
              {project.technologies.length > 6 && (
                <span className="px-2 py-1 text-xs text-gray-500">
                  +{project.technologies.length - 6} more
                </span>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
            {/* Team Size */}
            {project.teamMembers && project.teamMembers.length > 0 && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>{project.teamMembers.length} team member{project.teamMembers.length !== 1 ? 's' : ''}</span>
              </div>
            )}

            {/* Privacy Status */}
            {project.visibility && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {project.visibility === 'private' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>
                <span className="capitalize">{project.visibility}</span>
              </div>
            )}

            {/* Dates */}
            {project.startDate && (
              <span>
                Started {new Date(project.startDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 ml-4">
            {onEdit && (
              <button
                onClick={() => onEdit(project)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(project._id)}
                className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectCard
