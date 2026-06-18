const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Recipient
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Notification type
  type: {
    type: String,
    enum: [
      'connectionRequest',
      'connectionAccepted',
      'connectionRejected',
      'eventSubmitted',
      'eventApproved',
      'eventRejected',
      'eventStarred',
      'eventCommented',
      'commentApproved',
      'commentRejected',
      'projectInvitation',
      'projectAccepted',
      'projectRejected',
      'organizationInvitation',
      'newWatcher',
      'mention'
    ],
    required: true
  },
  
  // Sender/Actor
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Related entities
  relatedEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  relatedProject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  relatedComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  relatedConnection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Connection'
  },
  relatedOrganization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  
  // Notification content
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  
  // Link/action URL
  actionUrl: String,
  
  // Status
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  
  // Metadata
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1 });
notificationSchema.index({ createdAt: -1 });

// Mark as read method
notificationSchema.methods.markAsRead = async function() {
  this.isRead = true;
  this.readAt = new Date();
  await this.save();
};

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
  const notification = await this.create(data);
  
  // Emit socket event for real-time notification
  const io = require('../socket').getIO();
  if (io) {
    io.to(data.recipient.toString()).emit('notification', notification);
  }
  
  return notification;
};

module.exports = mongoose.model('Notification', notificationSchema);
