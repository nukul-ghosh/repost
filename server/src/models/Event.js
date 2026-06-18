const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  // Owner of the timeline
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Event Type
  eventType: {
    type: String,
    enum: ['skill', 'project', 'certification', 'endorsement', 'achievement', 'education', 'experience'],
    required: true
  },
  
  // Basic Information
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 2000
  },
  
  // Timeline
  eventDate: {
    type: Date,
    required: true,
    index: true
  },
  endDate: Date, // For ongoing projects or experiences
  isOngoing: {
    type: Boolean,
    default: false
  },
  
  // Source & Verification
  source: {
    type: {
      type: String,
      enum: ['self', 'user', 'organization', 'external']
    },
    url: String,
    description: String
  },
  
  // Who added this event
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // For skills
  skillLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert']
  },
  
  // For projects - link to project
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  
  // For certifications
  issuingOrganization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  credentialId: String,
  credentialUrl: String,
  
  // For endorsements (from managers, colleagues)
  endorsementType: {
    type: String,
    enum: ['skill', 'softSkill', 'leadership', 'teamwork', 'delivery', 'innovation', 'other']
  },
  endorsementText: String,
  
  // Tags
  tags: [String],
  
  // Approval Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: function() {
      // If self-added, auto-approve
      return this.addedBy.toString() === this.user.toString() ? 'approved' : 'pending';
    }
  },
  
  // Rejection reason (if rejected)
  rejectionReason: String,
  rejectedAt: Date,
  
  // Approval/Rejection timestamp
  reviewedAt: Date,
  
  // Stars (endorsements)
  starsCount: {
    type: Number,
    default: 0
  },
  weightedStarsScore: {
    type: Number,
    default: 0
  },
  
  // Comments count
  commentsCount: {
    type: Number,
    default: 0
  },
  
  // Privacy & Visibility
  visibility: {
    type: String,
    enum: ['public', 'connectionsOnly', 'private'],
    default: 'public'
  },
  starVisibility: {
    type: String,
    enum: ['showAll', 'countOnly', 'anonymous'],
    default: 'showAll'
  },
  
  // Comment moderation for this specific event
  commentModeration: {
    mode: {
      type: String,
      enum: ['autoApproveAll', 'autoApproveConnections', 'manualReview', 'aiFilter', 'useDefault']
    },
    useDefault: {
      type: Boolean,
      default: true
    }
  },
  
  // Media attachments
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'document', 'link']
    },
    url: String,
    publicId: String,
    title: String
  }],
  
  // Metadata
  isHighlight: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for stars
eventSchema.virtual('stars', {
  ref: 'Star',
  localField: '_id',
  foreignField: 'event'
});

// Virtual for comments
eventSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'event',
  options: { sort: { createdAt: -1 } }
});

// Indexes
eventSchema.index({ user: 1, eventDate: -1 });
eventSchema.index({ addedBy: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ eventType: 1 });
eventSchema.index({ tags: 1 });
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });
eventSchema.index({ project: 1 });

// Middleware to update stars count
eventSchema.methods.updateStarsCount = async function() {
  const Star = mongoose.model('Star');
  const stars = await Star.find({ event: this._id });
  
  this.starsCount = stars.length;
  
  // Calculate weighted score
  let weightedScore = 0;
  for (const star of stars) {
    weightedScore += star.weight;
  }
  this.weightedStarsScore = weightedScore;
  
  await this.save();
};

module.exports = mongoose.model('Event', eventSchema);
