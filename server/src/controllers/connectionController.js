const Connection = require('../models/Connection');
const Watch = require('../models/Watch');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Send connection request
// @route   POST /api/connections/request
// @access  Private
exports.sendConnectionRequest = async (req, res, next) => {
  try {
    const { recipientId, message } = req.body;
    
    // Can't connect to yourself
    if (recipientId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send connection request to yourself'
      });
    }
    
    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if connection already exists
    const existingConnection = await Connection.findOne({
      $or: [
        { requester: req.user.id, recipient: recipientId },
        { requester: recipientId, recipient: req.user.id }
      ]
    });
    
    if (existingConnection) {
      return res.status(400).json({
        success: false,
        message: 'Connection request already exists or you are already connected'
      });
    }
    
    // Create connection request
    const connection = await Connection.create({
      requester: req.user.id,
      recipient: recipientId,
      requestMessage: message,
      status: 'pending'
    });
    
    // Create notification
    await Notification.createNotification({
      recipient: recipientId,
      sender: req.user.id,
      type: 'connectionRequest',
      title: 'New Connection Request',
      message: `${req.user.firstName} ${req.user.lastName} sent you a connection request`,
      relatedConnection: connection._id,
      actionUrl: `/connections/requests`
    });
    
    res.status(201).json({
      success: true,
      connection
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get received connection requests
// @route   GET /api/connections/requests/received
// @access  Private
exports.getReceivedRequests = async (req, res, next) => {
  try {
    const requests = await Connection.find({
      recipient: req.user.id,
      status: 'pending'
    })
    .populate('requester', 'firstName lastName profilePicture headline')
    .sort('-createdAt');
    
    res.json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sent connection requests
// @route   GET /api/connections/requests/sent
// @access  Private
exports.getSentRequests = async (req, res, next) => {
  try {
    const requests = await Connection.find({
      requester: req.user.id,
      status: 'pending'
    })
    .populate('recipient', 'firstName lastName profilePicture headline')
    .sort('-createdAt');
    
    res.json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept connection request
// @route   PUT /api/connections/:id/accept
// @access  Private
exports.acceptConnection = async (req, res, next) => {
  try {
    const connection = await Connection.findById(req.params.id);
    
    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection request not found'
      });
    }
    
    // Only recipient can accept
    if (connection.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this request'
      });
    }
    
    if (connection.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Connection request is not pending'
      });
    }
    
    connection.status = 'accepted';
    connection.acceptedAt = new Date();
    await connection.save();
    
    // Update connection counts
    await User.findByIdAndUpdate(connection.requester, { $inc: { connectionsCount: 1 } });
    await User.findByIdAndUpdate(connection.recipient, { $inc: { connectionsCount: 1 } });
    
    // Create notification
    await Notification.createNotification({
      recipient: connection.requester,
      sender: req.user.id,
      type: 'connectionAccepted',
      title: 'Connection Accepted',
      message: `${req.user.firstName} ${req.user.lastName} accepted your connection request`,
      relatedConnection: connection._id,
      actionUrl: `/profile/${req.user.id}`
    });
    
    res.json({
      success: true,
      connection
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject connection request
// @route   PUT /api/connections/:id/reject
// @access  Private
exports.rejectConnection = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const connection = await Connection.findById(req.params.id);
    
    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection request not found'
      });
    }
    
    // Only recipient can reject
    if (connection.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this request'
      });
    }
    
    if (connection.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Connection request is not pending'
      });
    }
    
    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a reason for rejection'
      });
    }
    
    connection.status = 'rejected';
    connection.rejectionReason = reason;
    connection.rejectedAt = new Date();
    await connection.save();
    
    // Create notification
    await Notification.createNotification({
      recipient: connection.requester,
      sender: req.user.id,
      type: 'connectionRejected',
      title: 'Connection Request Declined',
      message: `Your connection request was declined`,
      relatedConnection: connection._id,
      actionUrl: `/connections/requests`,
      metadata: { reason }
    });
    
    res.json({
      success: true,
      connection
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove connection
// @route   DELETE /api/connections/:id
// @access  Private
exports.removeConnection = async (req, res, next) => {
  try {
    const connection = await Connection.findById(req.params.id);
    
    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found'
      });
    }
    
    // Either party can remove connection
    if (connection.requester.toString() !== req.user.id && 
        connection.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove this connection'
      });
    }
    
    if (connection.status === 'accepted') {
      // Update connection counts
      await User.findByIdAndUpdate(connection.requester, { $inc: { connectionsCount: -1 } });
      await User.findByIdAndUpdate(connection.recipient, { $inc: { connectionsCount: -1 } });
    }
    
    await connection.remove();
    
    res.json({
      success: true,
      message: 'Connection removed'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my connections
// @route   GET /api/connections/my-connections
// @access  Private
exports.getMyConnections = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const connections = await Connection.find({
      $or: [
        { requester: req.user.id, status: 'accepted' },
        { recipient: req.user.id, status: 'accepted' }
      ]
    })
    .populate('requester', 'firstName lastName profilePicture headline currentPosition')
    .populate('recipient', 'firstName lastName profilePicture headline currentPosition')
    .sort('-acceptedAt')
    .limit(limit)
    .skip(skip);
    
    // Format connections to show the other user
    const formattedConnections = connections.map(conn => {
      const otherUser = conn.requester._id.toString() === req.user.id 
        ? conn.recipient 
        : conn.requester;
      
      return {
        _id: conn._id,
        user: otherUser,
        connectedAt: conn.acceptedAt,
        connectionStrength: conn.connectionStrength
      };
    });
    
    const total = await Connection.countDocuments({
      $or: [
        { requester: req.user.id, status: 'accepted' },
        { recipient: req.user.id, status: 'accepted' }
      ]
    });
    
    res.json({
      success: true,
      count: formattedConnections.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      connections: formattedConnections
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get mutual connections
// @route   GET /api/connections/mutual/:userId
// @access  Private
exports.getMutualConnections = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    // Get current user's connections
    const myConnections = await Connection.find({
      $or: [
        { requester: req.user.id, status: 'accepted' },
        { recipient: req.user.id, status: 'accepted' }
      ]
    });
    
    const myConnectionIds = myConnections.map(conn => 
      conn.requester.toString() === req.user.id ? conn.recipient.toString() : conn.requester.toString()
    );
    
    // Get target user's connections
    const theirConnections = await Connection.find({
      $or: [
        { requester: userId, status: 'accepted' },
        { recipient: userId, status: 'accepted' }
      ]
    });
    
    const theirConnectionIds = theirConnections.map(conn =>
      conn.requester.toString() === userId ? conn.recipient.toString() : conn.requester.toString()
    );
    
    // Find mutual connections
    const mutualIds = myConnectionIds.filter(id => theirConnectionIds.includes(id));
    
    const mutualConnections = await User.find({ _id: { $in: mutualIds } })
      .select('firstName lastName profilePicture headline currentPosition');
    
    res.json({
      success: true,
      count: mutualConnections.length,
      mutualConnections
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Watch/Follow a user
// @route   POST /api/connections/watch/user/:userId
// @access  Private
exports.watchUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot watch yourself'
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if already watching
    const existingWatch = await Watch.findOne({
      watcher: req.user.id,
      targetType: 'user',
      targetUser: userId
    });
    
    if (existingWatch) {
      return res.status(400).json({
        success: false,
        message: 'Already watching this user'
      });
    }
    
    const watch = await Watch.create({
      watcher: req.user.id,
      targetType: 'user',
      targetUser: userId
    });
    
    // Update counts
    await User.findByIdAndUpdate(req.user.id, { $inc: { watchingCount: 1 } });
    await User.findByIdAndUpdate(userId, { $inc: { watchersCount: 1 } });
    
    // Create notification
    await Notification.createNotification({
      recipient: userId,
      sender: req.user.id,
      type: 'newWatcher',
      title: 'New Watcher',
      message: `${req.user.firstName} ${req.user.lastName} is now watching you`,
      actionUrl: `/profile/${req.user.id}`
    });
    
    res.status(201).json({
      success: true,
      watch
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Watch/Follow an organization
// @route   POST /api/connections/watch/organization/:orgId
// @access  Private
exports.watchOrganization = async (req, res, next) => {
  try {
    const { orgId } = req.params;
    const Organization = require('../models/Organization');
    
    const org = await Organization.findById(orgId);
    if (!org) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }
    
    const existingWatch = await Watch.findOne({
      watcher: req.user.id,
      targetType: 'organization',
      targetOrganization: orgId
    });
    
    if (existingWatch) {
      return res.status(400).json({
        success: false,
        message: 'Already watching this organization'
      });
    }
    
    const watch = await Watch.create({
      watcher: req.user.id,
      targetType: 'organization',
      targetOrganization: orgId
    });
    
    // Update counts
    await User.findByIdAndUpdate(req.user.id, { $inc: { watchingCount: 1 } });
    await Organization.findByIdAndUpdate(orgId, { $inc: { watchersCount: 1 } });
    
    res.status(201).json({
      success: true,
      watch
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unwatch user
// @route   DELETE /api/connections/watch/user/:userId
// @access  Private
exports.unwatchUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const watch = await Watch.findOneAndDelete({
      watcher: req.user.id,
      targetType: 'user',
      targetUser: userId
    });
    
    if (!watch) {
      return res.status(404).json({
        success: false,
        message: 'Not watching this user'
      });
    }
    
    // Update counts
    await User.findByIdAndUpdate(req.user.id, { $inc: { watchingCount: -1 } });
    await User.findByIdAndUpdate(userId, { $inc: { watchersCount: -1 } });
    
    res.json({
      success: true,
      message: 'Unwatched user'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unwatch organization
// @route   DELETE /api/connections/watch/organization/:orgId
// @access  Private
exports.unwatchOrganization = async (req, res, next) => {
  try {
    const { orgId } = req.params;
    const Organization = require('../models/Organization');
    
    const watch = await Watch.findOneAndDelete({
      watcher: req.user.id,
      targetType: 'organization',
      targetOrganization: orgId
    });
    
    if (!watch) {
      return res.status(404).json({
        success: false,
        message: 'Not watching this organization'
      });
    }
    
    // Update counts
    await User.findByIdAndUpdate(req.user.id, { $inc: { watchingCount: -1 } });
    await Organization.findByIdAndUpdate(orgId, { $inc: { watchersCount: -1 } });
    
    res.json({
      success: true,
      message: 'Unwatched organization'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get users/orgs I'm watching
// @route   GET /api/connections/watching
// @access  Private
exports.getWatching = async (req, res, next) => {
  try {
    const watches = await Watch.find({ watcher: req.user.id })
      .populate('targetUser', 'firstName lastName profilePicture headline')
      .populate('targetOrganization', 'name logo tagline')
      .sort('-createdAt');
    
    res.json({
      success: true,
      count: watches.length,
      watches
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my watchers
// @route   GET /api/connections/watchers
// @access  Private
exports.getWatchers = async (req, res, next) => {
  try {
    const watchers = await Watch.find({
      targetType: 'user',
      targetUser: req.user.id
    })
    .populate('watcher', 'firstName lastName profilePicture headline')
    .sort('-createdAt');
    
    res.json({
      success: true,
      count: watchers.length,
      watchers
    });
  } catch (error) {
    next(error);
  }
};
