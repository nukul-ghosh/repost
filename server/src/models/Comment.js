const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  // The event being commented on
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
    index: true
  },
  
  // Author of the comment
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Comment content
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    maxlength: 2000,
    trim: true
  },
  
  // Moderation status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'pending'
  },
  
  // Rejection reason (from event owner)
  rejectionReason: String,
  rejectedAt: Date,
  
  // Review metadata
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  
  // AI moderation flags
  aiModerationFlags: {
    isProfane: {
      type: Boolean,
      default: false
    },
    isToxic: {
      type: Boolean,
      default: false
    },
    isSpam: {
      type: Boolean,
      default: false
    },
    confidence: Number
  },
  
  // Anonymous posting (hide name in public view if event owner allows)
  isAnonymous: {
    type: Boolean,
    default: false
  },
  
  // Reply to another comment (nested comments)
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  
  // Replies count
  repliesCount: {
    type: Number,
    default: 0
  },
  
  // Likes/reactions
  likesCount: {
    type: Number,
    default: 0
  },
  
  // Edited
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  
  // Reported/flagged by users
  reports: [{
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes
commentSchema.index({ event: 1, createdAt: -1 });
commentSchema.index({ author: 1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ status: 1 });

// Virtual for replies
commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentComment',
  options: { sort: { createdAt: 1 } }
});

// Post-save middleware to update event comments count
commentSchema.post('save', async function(doc) {
  if (doc.status === 'approved' && !doc.parentComment) {
    const Event = mongoose.model('Event');
    await Event.findByIdAndUpdate(doc.event, {
      $inc: { commentsCount: 1 }
    });
  }
  
  // Update parent comment replies count
  if (doc.parentComment && doc.status === 'approved') {
    await this.model('Comment').findByIdAndUpdate(doc.parentComment, {
      $inc: { repliesCount: 1 }
    });
  }
});

// Pre-remove middleware to update counts
commentSchema.pre('remove', async function(next) {
  if (this.status === 'approved' && !this.parentComment) {
    const Event = mongoose.model('Event');
    await Event.findByIdAndUpdate(this.event, {
      $inc: { commentsCount: -1 }
    });
  }
  
  if (this.parentComment && this.status === 'approved') {
    await this.model('Comment').findByIdAndUpdate(this.parentComment, {
      $inc: { repliesCount: -1 }
    });
  }
  next();
});

module.exports = mongoose.model('Comment', commentSchema);
