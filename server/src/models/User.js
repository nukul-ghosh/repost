const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false
  },
  
  // User Type
  userType: {
    type: String,
    enum: ['individual', 'organizationAdmin'],
    default: 'individual'
  },
  
  // Profile Information
  profilePicture: {
    url: String,
    publicId: String
  },
  headline: {
    type: String,
    maxlength: 200,
    trim: true
  },
  bio: {
    type: String,
    maxlength: 2000
  },
  location: {
    city: String,
    country: String
  },
  website: String,
  
  // If Organization Admin
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  
  // Current Position
  currentPosition: {
    title: String,
    company: String,
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization'
    }
  },
  
  // Privacy Settings
  privacySettings: {
    profileVisibility: {
      type: String,
      enum: ['public', 'connectionsOnly', 'private'],
      default: 'public'
    },
    showEmail: {
      type: Boolean,
      default: false
    },
    showLocation: {
      type: Boolean,
      default: true
    },
    allowEventSubmissions: {
      type: Boolean,
      default: true
    },
    
    // Default event settings (can be overridden per event)
    defaultEventVisibility: {
      type: String,
      enum: ['public', 'connectionsOnly', 'private'],
      default: 'public'
    },
    defaultStarVisibility: {
      type: String,
      enum: ['showAll', 'countOnly', 'anonymous'],
      default: 'showAll'
    },
    
    // Comment moderation settings
    commentModeration: {
      mode: {
        type: String,
        enum: ['autoApproveAll', 'autoApproveConnections', 'manualReview', 'aiFilter'],
        default: 'autoApproveConnections'
      },
      perEventOverride: {
        type: Boolean,
        default: false
      }
    }
  },
  
  // Connections Stats
  connectionsCount: {
    type: Number,
    default: 0
  },
  watchersCount: {
    type: Number,
    default: 0
  },
  watchingCount: {
    type: Number,
    default: 0
  },
  
  // Account Status
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Verification Token
  verificationToken: String,
  verificationTokenExpire: Date,
  
  // Password Reset
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
  // Last Activity
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for timeline events
userSchema.virtual('timelineEvents', {
  ref: 'Event',
  localField: '_id',
  foreignField: 'user',
  options: { sort: { eventDate: -1 } }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get public profile (for non-authenticated users)
userSchema.methods.getPublicProfile = function() {
  return {
    _id: this._id,
    firstName: this.firstName.charAt(0) + '*'.repeat(this.firstName.length - 1),
    lastName: this.lastName.charAt(0) + '*'.repeat(this.lastName.length - 1),
    headline: this.headline,
    location: this.location,
    connectionsCount: this.connectionsCount,
    // Profile picture is hidden for public
    profilePicture: null
  };
};

// Get safe profile (for authenticated users)
userSchema.methods.getSafeProfile = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Check if this user is connected with another user
userSchema.methods.isConnectionWith = async function(otherUserId) {
  const Connection = mongoose.model('Connection');
  const connection = await Connection.findOne({
    $or: [
      { requester: this._id, recipient: otherUserId, status: 'accepted' },
      { requester: otherUserId, recipient: this._id, status: 'accepted' }
    ]
  });
  return !!connection;
};

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ firstName: 'text', lastName: 'text', headline: 'text' });
userSchema.index({ 'location.city': 1, 'location.country': 1 });
userSchema.index({ userType: 1 });

module.exports = mongoose.model('User', userSchema);
