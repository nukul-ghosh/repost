const { validationResult } = require('express-validator');
const Project = require('../models/Project');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { getIO } = require('../socket');

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      title,
      description,
      startDate,
      endDate,
      isOngoing,
      category,
      technologies,
      tags,
      projectUrl,
      repositoryUrl,
      demoUrl,
      visibility,
      status,
      achievements
    } = req.body;

    const project = await Project.create({
      title,
      description,
      startDate,
      endDate,
      isOngoing,
      category,
      technologies,
      tags,
      projectUrl,
      repositoryUrl,
      demoUrl,
      visibility: visibility || 'public',
      status: status || 'planning',
      achievements,
      createdBy: req.user.id,
      teamMembers: [
        {
          user: req.user.id,
          role: 'Creator',
          status: 'approved', // Auto-approve creator
          addedBy: req.user.id,
          approvedAt: new Date()
        }
      ]
    });

    await project.populate('createdBy', 'firstName lastName profilePicture');
    await project.populate('teamMembers.user', 'firstName lastName profilePicture');

    res.status(201).json({
      success: true,
      project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get project by ID or slug
// @route   GET /api/projects/:id
// @access  Public (respects visibility)
exports.getProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Try to find by ID first, then by slug
    let project = await Project.findById(id)
      .populate('createdBy', 'firstName lastName profilePicture headline')
      .populate('teamMembers.user', 'firstName lastName profilePicture headline')
      .populate('teamMembers.addedBy', 'firstName lastName')
      .populate('organizations.organization', 'name logo')
      .populate('organizations.claimedBy', 'firstName lastName');

    if (!project) {
      project = await Project.findOne({ slug: id })
        .populate('createdBy', 'firstName lastName profilePicture headline')
        .populate('teamMembers.user', 'firstName lastName profilePicture headline')
        .populate('teamMembers.addedBy', 'firstName lastName')
        .populate('organizations.organization', 'name logo')
        .populate('organizations.claimedBy', 'firstName lastName');
    }

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check visibility permissions
    const isCreator = req.user && project.createdBy._id.toString() === req.user.id;
    const isTeamMember = req.user && project.teamMembers.some(
      (member) =>
        member.user._id.toString() === req.user.id && member.status === 'approved'
    );

    if (!isCreator && !isTeamMember) {
      if (project.visibility === 'private' || project.visibility === 'teamOnly') {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view this project'
        });
      }

      if (project.visibility === 'connectionsOnly') {
        if (!req.user) {
          return res.status(403).json({
            success: false,
            message: 'You must be connected to view this project'
          });
        }

        const viewerUser = await User.findById(req.user.id);
        const isConnection = await viewerUser.isConnectionWith(
          project.createdBy._id.toString()
        );

        if (!isConnection) {
          return res.status(403).json({
            success: false,
            message: 'You must be connected to view this project'
          });
        }
      }
    }

    // Increment views count
    if (!isCreator) {
      project.viewsCount += 1;
      await project.save({ validateBeforeSave: false });
    }

    res.json({
      success: true,
      project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (creator only)
exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is creator
    if (project.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project'
      });
    }

    const allowedUpdates = [
      'title',
      'description',
      'startDate',
      'endDate',
      'isOngoing',
      'category',
      'technologies',
      'tags',
      'projectUrl',
      'repositoryUrl',
      'demoUrl',
      'visibility',
      'showTeamComposition',
      'status',
      'achievements',
      'coverImage',
      'images'
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        project[field] = req.body[field];
      }
    });

    await project.save();

    res.json({
      success: true,
      project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (creator only)
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is creator
    if (project.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project'
      });
    }

    await project.deleteOne();

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add team member to project
// @route   POST /api/projects/:id/members
// @access  Private (creator or approved team members)
exports.addTeamMember = async (req, res, next) => {
  try {
    const { userId, role, contribution } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if requester is creator or approved team member
    const isCreator = project.createdBy.toString() === req.user.id;
    const isApprovedMember = project.teamMembers.some(
      (member) =>
        member.user.toString() === req.user.id && member.status === 'approved'
    );

    if (!isCreator && !isApprovedMember) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add team members'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is already a team member
    const existingMember = project.teamMembers.find(
      (member) => member.user.toString() === userId
    );

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a team member'
      });
    }

    // Add team member with pending status
    project.teamMembers.push({
      user: userId,
      role,
      contribution,
      status: 'pending',
      addedBy: req.user.id
    });

    await project.save();

    // Send notification to the user being added
    const notification = await Notification.create({
      recipient: userId,
      sender: req.user.id,
      type: 'projectInvite',
      relatedProject: project._id,
      message: `${req.user.firstName} ${req.user.lastName} added you to project "${project.title}"`
    });

    const io = getIO();
    io.to(userId).emit('notification', notification);

    await project.populate('teamMembers.user', 'firstName lastName profilePicture');

    res.json({
      success: true,
      project,
      message: 'Team member added. Waiting for approval.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve team membership
// @route   PUT /api/projects/:id/members/:userId/approve
// @access  Private (user being added only)
exports.approveTeamMembership = async (req, res, next) => {
  try {
    const { id, userId } = req.params;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // User can only approve their own membership
    if (userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only approve your own membership'
      });
    }

    // Find team member
    const memberIndex = project.teamMembers.findIndex(
      (member) => member.user.toString() === userId
    );

    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    const member = project.teamMembers[memberIndex];

    if (member.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Membership is not pending approval'
      });
    }

    // Approve membership
    project.teamMembers[memberIndex].status = 'approved';
    project.teamMembers[memberIndex].approvedAt = new Date();

    await project.save();

    // Notify the person who added them
    const notification = await Notification.create({
      recipient: member.addedBy,
      sender: req.user.id,
      type: 'projectAccepted',
      relatedProject: project._id,
      message: `${req.user.firstName} ${req.user.lastName} accepted your project invitation`
    });

    const io = getIO();
    io.to(member.addedBy.toString()).emit('notification', notification);

    res.json({
      success: true,
      project,
      message: 'Team membership approved'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject team membership
// @route   PUT /api/projects/:id/members/:userId/reject
// @access  Private (user being added only)
exports.rejectTeamMembership = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const { reason } = req.body;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // User can only reject their own membership
    if (userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only reject your own membership'
      });
    }

    // Find and remove team member
    const memberIndex = project.teamMembers.findIndex(
      (member) => member.user.toString() === userId
    );

    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    const member = project.teamMembers[memberIndex];

    if (member.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Membership is not pending approval'
      });
    }

    // Store rejection info before removing
    const addedBy = member.addedBy;

    // Remove from team members
    project.teamMembers.splice(memberIndex, 1);
    await project.save();

    // Notify the person who added them
    const notification = await Notification.create({
      recipient: addedBy,
      sender: req.user.id,
      type: 'projectRejected',
      relatedProject: project._id,
      message: `${req.user.firstName} ${req.user.lastName} declined your project invitation${
        reason ? `: ${reason}` : ''
      }`
    });

    const io = getIO();
    io.to(addedBy.toString()).emit('notification', notification);

    res.json({
      success: true,
      message: 'Team membership rejected'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove team member
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private (creator or the member themselves)
exports.removeTeamMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check authorization: creator or the member themselves
    const isCreator = project.createdBy.toString() === req.user.id;
    const isSelf = userId === req.user.id;

    if (!isCreator && !isSelf) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove this team member'
      });
    }

    // Cannot remove creator
    if (userId === project.createdBy.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove project creator'
      });
    }

    // Find and remove team member
    const memberIndex = project.teamMembers.findIndex(
      (member) => member.user.toString() === userId
    );

    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    project.teamMembers.splice(memberIndex, 1);
    await project.save();

    res.json({
      success: true,
      message: 'Team member removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get projects for a user
// @route   GET /api/projects/user/:userId
// @access  Public
exports.getUserProjects = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { limit = 20, skip = 0 } = req.query;

    // Find projects where user is creator or approved team member
    const projects = await Project.find({
      $or: [
        { createdBy: userId },
        {
          teamMembers: {
            $elemMatch: { user: userId, status: 'approved' }
          }
        }
      ]
    })
      .populate('createdBy', 'firstName lastName profilePicture')
      .populate('teamMembers.user', 'firstName lastName profilePicture')
      .sort({ startDate: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Project.countDocuments({
      $or: [
        { createdBy: userId },
        {
          teamMembers: {
            $elemMatch: { user: userId, status: 'approved' }
          }
        }
      ]
    });

    res.json({
      success: true,
      projects,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: total > parseInt(skip) + parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending project invitations for current user
// @route   GET /api/projects/invitations
// @access  Private
exports.getPendingInvitations = async (req, res, next) => {
  try {
    const projects = await Project.find({
      teamMembers: {
        $elemMatch: { user: req.user.id, status: 'pending' }
      }
    })
      .populate('createdBy', 'firstName lastName profilePicture')
      .populate('teamMembers.addedBy', 'firstName lastName')
      .sort({ 'teamMembers.addedAt': -1 });

    res.json({
      success: true,
      projects,
      count: projects.length
    });
  } catch (error) {
    next(error);
  }
};
