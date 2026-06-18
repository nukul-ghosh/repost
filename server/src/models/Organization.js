const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  
  // Profile
  logo: {
    url: String,
    publicId: String
  },
  coverImage: {
    url: String,
    publicId: String
  },
  tagline: {
    type: String,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 5000
  },
  
  // Details
  industry: String,
  companySize: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+']
  },
  foundedYear: Number,
  
  // Contact
  website: String,
  email: String,
  phone: String,
  
  // Location
  headquarters: {
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  
  // Social Links
  socialLinks: {
    linkedin: String,
    twitter: String,
    facebook: String,
    instagram: String,
    github: String
  },
  
  // Admins
  admins: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'moderator'],
      default: 'admin'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Employees (verified members)
  employees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    position: String,
    department: String,
    joinedAt: Date,
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date
  }],
  
  // Stats
  watchersCount: {
    type: Number,
    default: 0
  },
  employeeCount: {
    type: Number,
    default: 0
  },
  projectsCount: {
    type: Number,
    default: 0
  },
  
  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationBadge: {
    type: String,
    enum: ['none', 'verified', 'premium'],
    default: 'none'
  },
  
  // Privacy
  privacySettings: {
    showEmployees: {
      type: Boolean,
      default: true
    },
    showProjects: {
      type: Boolean,
      default: true
    },
    allowPublicComments: {
      type: Boolean,
      default: true
    }
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create slug before saving
organizationSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Virtual for projects
organizationSchema.virtual('projects', {
  ref: 'Project',
  localField: '_id',
  foreignField: 'organizations'
});

// Indexes
organizationSchema.index({ name: 'text', tagline: 'text', description: 'text' });
organizationSchema.index({ slug: 1 });
organizationSchema.index({ industry: 1 });
organizationSchema.index({ 'headquarters.city': 1, 'headquarters.country': 1 });

module.exports = mongoose.model('Organization', organizationSchema);
