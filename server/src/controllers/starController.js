const Star = require('../models/Star');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const { getIO } = require('../socket');

// @desc    Star an event (endorsement)
// @route   POST /api/stars/:eventId
// @access  Private
exports.starEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user already starred this event
    const existingStar = await Star.findOne({
      relatedEvent: eventId,
      user: req.user.id
    });

    if (existingStar) {
      return res.status(400).json({
        success: false,
        message: 'You have already starred this event'
      });
    }

    // Create star (weight calculated in pre-save hook)
    const star = await Star.create({
      relatedEvent: eventId,
      user: req.user.id
    });

    await star.populate('user', 'firstName lastName profilePicture');

    // Send notification to event owner (if not starring own event)
    if (event.user.toString() !== req.user.id) {
      const notification = await Notification.create({
        recipient: event.user,
        sender: req.user.id,
        type: 'eventStarred',
        relatedEvent: eventId,
        message: `${req.user.firstName} ${req.user.lastName} starred your event`
      });

      const io = getIO();
      io.to(event.user.toString()).emit('notification', notification);
    }

    res.status(201).json({
      success: true,
      star,
      message: 'Event starred successfully'
    });
  } catch (error) {
    // Handle duplicate star error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already starred this event'
      });
    }
    next(error);
  }
};

// @desc    Remove star from event
// @route   DELETE /api/stars/:eventId
// @access  Private
exports.unstarEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const star = await Star.findOne({
      relatedEvent: eventId,
      user: req.user.id
    });

    if (!star) {
      return res.status(404).json({
        success: false,
        message: 'Star not found'
      });
    }

    await star.deleteOne();

    // Update event stars count (handled by post-remove hook in model)
    res.json({
      success: true,
      message: 'Star removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all stars for an event with weighted score
// @route   GET /api/stars/event/:eventId
// @access  Public (respects event visibility)
exports.getEventStars = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { limit = 20, skip = 0 } = req.query;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check visibility based on event's starVisibility setting
    let stars;
    let showDetails = true;

    switch (event.starVisibility) {
      case 'countOnly':
        // Only return count, no user details
        showDetails = false;
        stars = [];
        break;

      case 'anonymous':
        // Return stars but anonymize users
        stars = await Star.find({ event: eventId })
          .limit(parseInt(limit))
          .skip(parseInt(skip))
          .sort({ createdAt: -1 });
        // Remove user details
        stars = stars.map((star) => ({
          weight: star.weight,
          createdAt: star.createdAt,
          context: star.context
        }));
        break;

      case 'showAll':
      default:
        // Show all stars with user details
        stars = await Star.find({ event: eventId })
          .populate('user', 'firstName lastName profilePicture headline')
          .populate('context.organization', 'name')
          .limit(parseInt(limit))
          .skip(parseInt(skip))
          .sort({ createdAt: -1 });
        break;
    }

    const total = await Star.countDocuments({ event: eventId });

    res.json({
      success: true,
      stars: showDetails ? stars : [],
      starsCount: event.starsCount,
      weightedScore: event.weightedStarsScore,
      visibility: event.starVisibility,
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

// @desc    Get stars given by a user
// @route   GET /api/stars/user/:userId/given
// @access  Public
exports.getStarsGivenByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { limit = 20, skip = 0 } = req.query;

    const stars = await Star.find({ user: userId })
      .populate({
        path: 'event',
        select: 'title eventType user eventDate',
        populate: {
          path: 'user',
          select: 'firstName lastName profilePicture'
        }
      })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort({ createdAt: -1 });

    const total = await Star.countDocuments({ user: userId });

    res.json({
      success: true,
      stars,
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

// @desc    Get stars received by a user (on their events)
// @route   GET /api/stars/user/:userId/received
// @access  Public
exports.getStarsReceivedByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { limit = 20, skip = 0 } = req.query;

    // Find all events owned by this user
    const events = await Event.find({ user: userId }).select('_id');
    const eventIds = events.map((e) => e._id);

    // Find stars on those events
    const stars = await Star.find({ event: { $in: eventIds } })
      .populate('user', 'firstName lastName profilePicture headline')
      .populate({
        path: 'event',
        select: 'title eventType eventDate'
      })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort({ createdAt: -1 });

    const total = await Star.countDocuments({ event: { $in: eventIds } });

    // Calculate total weighted score
    const allStars = await Star.find({ event: { $in: eventIds } });
    const totalWeightedScore = allStars.reduce((sum, star) => sum + star.weight, 0);

    res.json({
      success: true,
      stars,
      totalStarsReceived: total,
      totalWeightedScore,
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

// @desc    Check if current user has starred an event
// @route   GET /api/stars/:eventId/check
// @access  Private
exports.checkStarStatus = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const star = await Star.findOne({
      relatedEvent: eventId,
      user: req.user.id
    });

    res.json({
      success: true,
      hasStarred: !!star,
      star: star || null
    });
  } catch (error) {
    next(error);
  }
};
