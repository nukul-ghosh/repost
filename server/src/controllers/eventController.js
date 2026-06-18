const { validationResult } = require('express-validator');
const Event = require('../models/Event');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { getIO } = require('../socket');

// @desc    Create timeline event
// @route   POST /api/events
// @access  Private
exports.createEvent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      user: targetUserId,
      eventType,
      title,
      description,
      eventDate,
      endDate,
      isOngoing,
      skillLevel,
      project,
      issuingOrganization,
      credentialId,
      credentialUrl,
      tags,
      visibility,
      attachments
    } = req.body;

    // Check if target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create event
    const event = await Event.create({
      user: targetUserId,
      addedBy: req.user.id,
      eventType,
      title,
      description,
      eventDate,
      endDate,
      isOngoing,
      skillLevel,
      project,
      issuingOrganization,
      credentialId,
      credentialUrl,
      tags,
      visibility: visibility || 'public',
      attachments: attachments || []
    });

    // Populate references
    await event.populate('addedBy', 'firstName lastName profilePicture');
    await event.populate('user', 'firstName lastName');

    // If added by someone else, send notification
    if (targetUserId !== req.user.id) {
      const notification = await Notification.create({
        recipient: targetUserId,
        sender: req.user.id,
        type: 'eventSubmitted',
        relatedEvent: event._id,
        message: `${req.user.firstName} ${req.user.lastName} added an event to your timeline`
      });

      // Emit notification via Socket.io
      const io = getIO();
      io.to(targetUserId).emit('notification', notification);
    }

    res.status(201).json({
      success: true,
      event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's timeline events
// @route   GET /api/events/user/:userId
// @access  Public (respects privacy settings)
exports.getUserEvents = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { eventType, status, limit = 20, skip = 0 } = req.query;

    // Build query
    const query = {
      user: userId,
      status: 'approved' // Only show approved events by default
    };

    if (eventType) {
      query.eventType = eventType;
    }

    // If viewing own profile, show all statuses
    if (req.user && req.user.id === userId && status) {
      query.status = status;
    }

    // Handle visibility based on viewer
    const isOwnProfile = req.user && req.user.id === userId;
    const viewerUser = req.user ? await User.findById(req.user.id) : null;

    if (!isOwnProfile) {
      // Check if viewer is a connection
      const isConnection = viewerUser
        ? await viewerUser.isConnectionWith(userId)
        : false;

      if (isConnection) {
        query.visibility = { $in: ['public', 'connectionsOnly'] };
      } else {
        query.visibility = 'public';
      }
    }
    // If own profile, show all events regardless of visibility

    const events = await Event.find(query)
      .populate('addedBy', 'firstName lastName profilePicture')
      .populate('project', 'title')
      .populate('issuingOrganization', 'name logo')
      .sort({ eventDate: -1, isPinned: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      events,
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

// @desc    Get single event with details
// @route   GET /api/events/:id
// @access  Public (respects privacy settings)
exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('addedBy', 'firstName lastName profilePicture')
      .populate('user', 'firstName lastName profilePicture')
      .populate('project', 'title description')
      .populate('issuingOrganization', 'name logo');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check visibility permissions
    const isOwner = req.user && event.user._id.toString() === req.user.id;

    if (!isOwner) {
      if (event.visibility === 'private') {
        return res.status(403).json({
          success: false,
          message: 'This event is private'
        });
      }

      if (event.visibility === 'connectionsOnly') {
        if (!req.user) {
          return res.status(403).json({
            success: false,
            message: 'You must be connected to view this event'
          });
        }

        const viewerUser = await User.findById(req.user.id);
        const isConnection = await viewerUser.isConnectionWith(
          event.user._id.toString()
        );

        if (!isConnection) {
          return res.status(403).json({
            success: false,
            message: 'You must be connected to view this event'
          });
        }
      }
    }

    res.json({
      success: true,
      event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (owner only)
exports.updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check ownership
    if (event.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }

    const allowedUpdates = [
      'title',
      'description',
      'eventDate',
      'endDate',
      'isOngoing',
      'skillLevel',
      'tags',
      'visibility',
      'starVisibility',
      'commentModeration',
      'isHighlight',
      'isPinned',
      'attachments'
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
      }
    });

    await event.save();

    res.json({
      success: true,
      event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (owner only)
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check ownership
    if (event.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }

    await event.deleteOne();

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve pending event
// @route   POST /api/events/:id/approve
// @access  Private (timeline owner only)
exports.approveEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('addedBy', 'firstName lastName');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is the timeline owner
    if (event.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to approve this event'
      });
    }

    if (event.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Event is not pending approval'
      });
    }

    event.status = 'approved';
    event.reviewedAt = new Date();
    await event.save();

    // Send notification to the person who added the event
    if (event.addedBy.toString() !== req.user.id) {
      const notification = await Notification.create({
        recipient: event.addedBy._id,
        sender: req.user.id,
        type: 'eventApproved',
        relatedEvent: event._id,
        message: `${req.user.firstName} ${req.user.lastName} approved your event submission`
      });

      const io = getIO();
      io.to(event.addedBy._id.toString()).emit('notification', notification);
    }

    res.json({
      success: true,
      event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject pending event
// @route   POST /api/events/:id/reject
// @access  Private (timeline owner only)
exports.rejectEvent = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const event = await Event.findById(req.params.id)
      .populate('addedBy', 'firstName lastName');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is the timeline owner
    if (event.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this event'
      });
    }

    if (event.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Event is not pending approval'
      });
    }

    event.status = 'rejected';
    event.rejectionReason = reason || 'No reason provided';
    event.rejectedAt = new Date();
    event.reviewedAt = new Date();
    await event.save();

    // Send notification to the person who added the event with reason
    if (event.addedBy.toString() !== req.user.id) {
      const notification = await Notification.create({
        recipient: event.addedBy._id,
        sender: req.user.id,
        type: 'eventRejected',
        relatedEvent: event._id,
        message: `${req.user.firstName} ${req.user.lastName} rejected your event submission${
          reason ? `: ${reason}` : ''
        }`
      });

      const io = getIO();
      io.to(event.addedBy._id.toString()).emit('notification', notification);
    }

    res.json({
      success: true,
      event,
      message: 'Event rejected successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending events for current user
// @route   GET /api/events/pending
// @access  Private
exports.getPendingEvents = async (req, res, next) => {
  try {
    const events = await Event.find({
      user: req.user.id,
      status: 'pending'
    })
      .populate('addedBy', 'firstName lastName profilePicture')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      events,
      count: events.length
    });
  } catch (error) {
    next(error);
  }
};
