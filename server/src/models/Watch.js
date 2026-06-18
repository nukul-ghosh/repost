const mongoose = require('mongoose');

const watchSchema = new mongoose.Schema({
  // Watcher (the one who is watching/following)
  watcher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Target being watched
  targetType: {
    type: String,
    enum: ['user', 'organization'],
    required: true
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  targetOrganization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  
  // Notification preferences
  notifications: {
    newEvent: {
      type: Boolean,
      default: true
    },
    newProject: {
      type: Boolean,
      default: true
    },
    majorUpdate: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate watches
watchSchema.index({ watcher: 1, targetType: 1, targetUser: 1 }, { unique: true, sparse: true });
watchSchema.index({ watcher: 1, targetType: 1, targetOrganization: 1 }, { unique: true, sparse: true });
watchSchema.index({ targetUser: 1 });
watchSchema.index({ targetOrganization: 1 });

module.exports = mongoose.model('Watch', watchSchema);
