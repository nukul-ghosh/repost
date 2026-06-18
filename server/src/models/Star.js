const mongoose = require('mongoose');

const starSchema = new mongoose.Schema({
  // The event being starred
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
    index: true
  },
  
  // Who starred it
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Weight calculation
  weight: {
    type: Number,
    default: 1
  },
  
  // Context for weight calculation
  context: {
    isConnection: {
      type: Boolean,
      default: false
    },
    sameOrganization: {
      type: Boolean,
      default: false
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization'
    }
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate stars
starSchema.index({ event: 1, user: 1 }, { unique: true });

// Pre-save middleware to calculate weight
starSchema.pre('save', async function(next) {
  if (!this.isNew) return next();
  
  const Event = mongoose.model('Event');
  const Connection = mongoose.model('Connection');
  const User = mongoose.model('User');
  
  const event = await Event.findById(this.event).populate('user');
  const starringUser = await User.findById(this.user);
  
  // Base weight
  let weight = 1;
  
  // Check if they're connected (1.5x weight)
  const areConnected = await Connection.areConnected(this.user, event.user._id);
  if (areConnected) {
    weight = 1.5;
    this.context.isConnection = true;
  }
  
  // Check if from same organization (2x weight, overrides connection bonus)
  if (starringUser.currentPosition?.organizationId && 
      event.user.currentPosition?.organizationId &&
      starringUser.currentPosition.organizationId.toString() === 
      event.user.currentPosition.organizationId.toString()) {
    weight = 2;
    this.context.sameOrganization = true;
    this.context.organization = starringUser.currentPosition.organizationId;
  }
  
  this.weight = weight;
  next();
});

// Post-save middleware to update event stars count
starSchema.post('save', async function(doc) {
  const Event = mongoose.model('Event');
  const event = await Event.findById(doc.event);
  if (event) {
    await event.updateStarsCount();
  }
});

// Post-remove middleware to update event stars count
starSchema.post('remove', async function(doc) {
  const Event = mongoose.model('Event');
  const event = await Event.findById(doc.event);
  if (event) {
    await event.updateStarsCount();
  }
});

module.exports = mongoose.model('Star', starSchema);
