const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 5000
  },
  
  // Timeline
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  isOngoing: {
    type: Boolean,
    default: false
  },
  
  // Creator
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Team Members
  teamMembers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: String,
    contribution: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    approvedAt: Date,
    rejectionReason: String
  }],
  
  // Organizations involved
  organizations: [{
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization'
    },
    role: {
      type: String,
      enum: ['owner', 'client', 'partner', 'contributor']
    },
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    claimedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Project Details
  category: {
    type: String,
    enum: ['software', 'design', 'marketing', 'research', 'consulting', 'other']
  },
  technologies: [String],
  tags: [String],
  
  // Links
  projectUrl: String,
  repositoryUrl: String,
  demoUrl: String,
  
  // Media
  coverImage: {
    url: String,
    publicId: String
  },
  images: [{
    url: String,
    publicId: String,
    caption: String
  }],
  
  // Privacy
  visibility: {
    type: String,
    enum: ['public', 'connectionsOnly', 'private', 'teamOnly'],
    default: 'public'
  },
  showTeamComposition: {
    type: Boolean,
    default: true
  },
  
  // Stats
  starsCount: {
    type: Number,
    default: 0
  },
  viewsCount: {
    type: Number,
    default: 0
  },
  
  // Status
  status: {
    type: String,
    enum: ['planning', 'inProgress', 'completed', 'cancelled', 'onHold'],
    default: 'planning'
  },
  
  // Achievements/Outcomes
  achievements: [String],
  
  // Featured
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create slug before saving
projectSchema.pre('save', function(next) {
  if (this.isModified('title') || !this.slug) {
    const baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    this.slug = `${baseSlug}-${Date.now().toString(36)}`;
  }
  next();
});

// Virtual for approved team members
projectSchema.virtual('approvedTeamMembers').get(function() {
  return this.teamMembers.filter(member => member.status === 'approved');
});

// Indexes
projectSchema.index({ slug: 1 });
projectSchema.index({ createdBy: 1 });
projectSchema.index({ 'teamMembers.user': 1 });
projectSchema.index({ 'organizations.organization': 1 });
projectSchema.index({ title: 'text', description: 'text', tags: 'text' });
projectSchema.index({ technologies: 1 });
projectSchema.index({ category: 1 });
projectSchema.index({ startDate: -1 });

module.exports = mongoose.model('Project', projectSchema);
