const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  // Connection between two users
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'blocked'],
    default: 'pending'
  },
  
  // Request message
  requestMessage: {
    type: String,
    maxlength: 300
  },
  
  // Rejection reason
  rejectionReason: String,
  rejectedAt: Date,
  
  // Acceptance
  acceptedAt: Date,
  
  // Additional metadata
  connectionStrength: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  
  // Interaction count (for future use)
  interactionCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate connections
connectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });
connectionSchema.index({ recipient: 1, status: 1 });
connectionSchema.index({ requester: 1, status: 1 });

// Static method to check if connection exists
connectionSchema.statics.areConnected = async function(userId1, userId2) {
  const connection = await this.findOne({
    $or: [
      { requester: userId1, recipient: userId2, status: 'accepted' },
      { requester: userId2, recipient: userId1, status: 'accepted' }
    ]
  });
  return !!connection;
};

module.exports = mongoose.model('Connection', connectionSchema);
