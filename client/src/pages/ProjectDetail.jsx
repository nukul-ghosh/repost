import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import {
  getProjectById,
  deleteProject,
  addTeamMember,
  approveTeamMember,
  removeTeamMember
} from '../services/projectService'

const ProjectDetail = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [project, setProject] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [newMemberRole, setNewMemberRole] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    fetchProject()
  }, [projectId])

  const fetchProject = async () => {
    try {
      setIsLoading(true)
      const response = await getProjectById(projectId)
      setProject(response.project)
    } catch (error) {
      console.error('Error fetching project:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this project? This action cannot be undone.')) return

    try {
      await deleteProject(projectId)
      navigate('/projects')
    } catch (error) {
      console.error('Error deleting project:', error)
      alert(error.response?.data?.message || 'Failed to delete project')
    }
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    if (!newMemberEmail || !newMemberRole) return

    try {
      setIsProcessing(true)
      await addTeamMember(projectId, {
        email: newMemberEmail,
        role: newMemberRole
      })
      setNewMemberEmail('')
      setNewMemberRole('')
      setShowAddMemberModal(false)
      fetchProject()
    } catch (error) {
      console.error('Error adding team member:', error)
      alert(error.response?.data?.message || 'Failed to add team member')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleApproveMember = async (userId) => {
    try {
      await approveTeamMember(projectId, userId)
      fetchProject()
    } catch (error) {
      console.error('Error approving member:', error)
      alert(error.response?.data?.message || 'Failed to approve member')
    }
  }

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this team member from the project?')) return

    try {
      await removeTeamMember(projectId, userId)
      fetchProject()
    } catch (error) {
      console.error('Error removing member:', error)
      alert(error.response?.data?.message || 'Failed to remove member')
    }
  }

  const isCreator = project?.createdBy?._id === user?.id
  const isTeamMember = project?.teamMembers?.some((member) => member.userId?._id === user?.id)
  const canManage = isCreator || isTeamMember

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Project not found
          </h3>
          <p className="text-gray-600 mb-6">
            This project may have been deleted or you don't have access
          </p>
          <Link
            to="/projects"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Browse Projects
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>

            {/* Organization */}
            {project.organizationId && (
              <Link
                to={`/organizations/${project.organizationId._id}`}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {project.organizationId.name}
              </Link>
            )}

            {/* Creator */}
            {project.createdBy && (
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <span>Created by</span>
                <Link
                  to={`/profile/${project.createdBy._id}`}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {project.createdBy.firstName} {project.createdBy.lastName}
                </Link>
              </div>
            )}
          </div>

          {/* Actions */}
          {canManage && (
            <div className="flex gap-2">
              <Link
                to={`/projects/${projectId}/edit`}
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

        {/* Metadata */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>{project.teamMembers?.length || 0} team members</span>
          </div>

          {project.startDate && (
            <span>Started {new Date(project.startDate).toLocaleDateString()}</span>
          )}

          {project.endDate && (
            <span>Ended {new Date(project.endDate).toLocaleDateString()}</span>
          )}

          <span className="capitalize">{project.visibility}</span>
        </div>

        {/* Description */}
        {project.description && (
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
          </div>
        )}

        {/* Technologies */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Technologies</h3>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Links */}
        {(project.githubUrl || project.liveUrl || project.demoUrl) && (
          <div className="mt-4 flex gap-3">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Live Site
              </a>
            )}
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Demo
              </a>
            )}
          </div>
        )}
      </div>

      {/* Team Members */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Team Members</h2>
          {canManage && (
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Add Member
            </button>
          )}
        </div>

        {project.teamMembers && project.teamMembers.length > 0 ? (
          <div className="space-y-4">
            {project.teamMembers.map((member) => (
              <div
                key={member._id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-600">
                    {member.userId?.profilePicture ? (
                      <img
                        src={member.userId.profilePicture}
                        alt={`${member.userId.firstName} ${member.userId.lastName}`}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      `${member.userId?.firstName?.[0] || ''}${member.userId?.lastName?.[0] || ''}`
                    )}
                  </div>
                  <div>
                    <Link
                      to={`/profile/${member.userId?._id}`}
                      className="font-semibold text-gray-900 hover:text-blue-600"
                    >
                      {member.userId?.firstName} {member.userId?.lastName}
                    </Link>
                    <p className="text-sm text-gray-600">{member.role}</p>
                    {member.status === 'pending' && (
                      <span className="text-xs text-yellow-600">Pending approval</span>
                    )}
                  </div>
                </div>

                {canManage && (
                  <div className="flex gap-2">
                    {member.status === 'pending' && (
                      <button
                        onClick={() => handleApproveMember(member.userId._id)}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
                      >
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveMember(member.userId._id)}
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
          <p className="text-gray-500 text-center py-8">No team members yet</p>
        )}
      </div>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Team Member</h3>
            <form onSubmit={handleAddMember}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="member@example.com"
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
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    placeholder="e.g., Frontend Developer"
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
                  {isProcessing ? 'Adding...' : 'Add Member'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
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

export default ProjectDetail
