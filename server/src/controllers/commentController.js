const { validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const Event = require('../models/Event');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { getIO } = require('../socket');
const { moderateContent } = require('../utils/moderationFilter');

// @desc    Add comment to event
// @route   POST /api/comments/:eventId
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { eventId } = req.params;
    const { content, parentComment } = req.body;

    // Check if event exists
    const event = await Event.findById(eventId).populate('user');
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if parent comment exists (for replies)
    if (parentComment) {
      const parent = await Comment.findById(parentComment);
      if (!parent || parent.event.toString() !== eventId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid parent comment'
        });
      }
    }

    // Run AI moderation
    const moderation = moderateContent(content);

    // Determine approval status based on event's comment moderation settings
    let status = 'pending';
    const commentModeration = event.commentModeration?.useDefault
      ? event.user.privacySettings?.commentModeration
      : event.commentModeration?.mode;

    switch (commentModeration) {
      case 'autoApproveAll':
        status = 'approved';
        break;

      case 'autoApproveConnections':
        // Check if commenter is connected to event owner
        const commenterUser = await User.findById(req.user.id);
        const isConnection = await commenterUser.isConnectionWith(
          event.user._id.toString()
        );
        status = isConnection ? 'approved' : 'pending';
        break;

      case 'manualReview':
        status = 'pending';
        break;

      case 'aiFilter':
        // Auto-approve if passes AI moderation
        status = moderation.shouldFlag ? 'flagged' : 'approved';
        break;

      default:
        status = 'approved'; // Default: auto-approve
    }

    // Create comment
    const comment = await Comment.create({
      event: eventId,
      author: req.user.id,
      content,
      parentComment,
      status,
      aiModerationFlags: {
        isProfane: moderation.isProfane,
        isToxic: moderation.isToxic,
        isSpam: moderation.isSpam,
        confidence: moderation.confidence
      }
    });

    await comment.populate('author', 'firstName lastName profilePicture');
    if (parentComment) {
      await comment.populate('parentComment', 'content author');
    }

    // Send notification to event owner (if not commenting on own event)
    if (event.user._id.toString() !== req.user.id) {
      const notification = await Notification.create({
        recipient: event.user._id,
        sender: req.user.id,
        type: 'eventCommented',
        relatedEvent: eventId,
        relatedComment: comment._id,
        message: `${req.user.firstName} ${req.user.lastName} commented on your event`
      });

      const io = getIO();
      io.to(event.user._id.toString()).emit('notification', notification);
    }

    res.status(201).json({
      success: true,
      comment,
      message:
        status === 'pending' || status === 'flagged'
          ? 'Comment submitted for review'
          : 'Comment added successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get comments for an event
// @route   GET /api/comments/event/:eventId
// @access  Public (respects moderation settings)
exports.getEventComments = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { limit = 20, skip = 0, includeReplies = 'false' } = req.query;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Build query
    const query = {
      event: eventId,
      parentComment: null // Only top-level comments
    };

    // Show only approved comments to non-owners
    const isOwner = req.user && event.user.toString() === req.user.id;
    if (!isOwner) {
      query.status = 'approved';
    }

    let commentsQuery = Comment.find(query)
      .populate('author', 'firstName lastName profilePicture headline')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    // Include replies if requested
    if (includeReplies === 'true') {
      commentsQuery = commentsQuery.populate({
        path: 'replies',
        match: isOwner ? {} : { status: 'approved' },
        populate: {
          path: 'author',
          select: 'firstName lastName profilePicture'
        }
      });
    }

    const comments = await commentsQuery;
    const total = await Comment.countDocuments(query);

    res.json({
      success: true,
      comments,
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

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private (author only)
exports.updateComment = async (req, res, next) => {
  try {
    const { content } = req.body;

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user is the author
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this comment'
      });
    }

    // Run moderation on updated content
    const moderation = moderateContent(content);

    // Update comment
    comment.content = content;
    comment.isEdited = true;
    comment.editedAt = new Date();

    // Flag if moderation fails
    if (moderation.shouldFlag) {
      comment.status = 'flagged';
      comment.aiModerationFlags = {
        isProfane: moderation.isProfane,
        isToxic: moderation.isToxic,
        isSpam: moderation.isSpam,
        confidence: moderation.confidence
      };
    }

    await comment.save();

    res.json({
      success: true,
      comment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private (author or event owner)
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id).populate('event');

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check authorization: author or event owner
    const isAuthor = comment.author.toString() === req.user.id;
    const isEventOwner = comment.event.user.toString() === req.user.id;

    if (!isAuthor && !isEventOwner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    await comment.deleteOne();

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Moderate comment (approve/reject)
// @route   POST /api/comments/:id/moderate
// @access  Private (event owner only)
exports.moderateComment = async (req, res, next) => {
  try {
    const { action, reason } = req.body; // action: 'approve' or 'reject'

    const comment = await Comment.findById(req.params.id)
      .populate('event')
      .populate('author', 'firstName lastName');

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user is the event owner
    if (comment.event.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to moderate this comment'
      });
    }

    if (action === 'approve') {
      comment.status = 'approved';
      comment.reviewedBy = req.user.id;
      comment.reviewedAt = new Date();

      // Notify comment author
      const notification = await Notification.create({
        recipient: comment.author._id,
        sender: req.user.id,
        type: 'commentApproved',
        relatedComment: comment._id,
        relatedEvent: comment.event._id,
        message: `Your comment on "${comment.event.title}" was approved`
      });

      const io = getIO();
      io.to(comment.author._id.toString()).emit('notification', notification);
    } else if (action === 'reject') {
      comment.status = 'rejected';
      comment.rejectionReason = reason || 'No reason provided';
      comment.rejectedAt = new Date();
      comment.reviewedBy = req.user.id;
      comment.reviewedAt = new Date();

      // Notify comment author with reason
      const notification = await Notification.create({
        recipient: comment.author._id,
        sender: req.user.id,
        type: 'commentRejected',
        relatedComment: comment._id,
        relatedEvent: comment.event._id,
        message: `Your comment was rejected${reason ? `: ${reason}` : ''}`
      });

      const io = getIO();
      io.to(comment.author._id.toString()).emit('notification', notification);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Use "approve" or "reject"'
      });
    }

    await comment.save();

    res.json({
      success: true,
      comment,
      message: `Comment ${action}d successfully`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending comments for review (event owner)
// @route   GET /api/comments/pending
// @access  Private
exports.getPendingComments = async (req, res, next) => {
  try {
    // Find all events owned by user
    const events = await Event.find({ user: req.user.id }).select('_id');
    const eventIds = events.map((e) => e._id);

    // Find pending/flagged comments on those events
    const comments = await Comment.find({
      event: { $in: eventIds },
      status: { $in: ['pending', 'flagged'] }
    })
      .populate('author', 'firstName lastName profilePicture')
      .populate('event', 'title')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      comments,
      count: comments.length
    });
  } catch (error) {
    next(error);
  }
};
