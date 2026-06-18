const Connection = require('../models/Connection');

// Check if two users are connected
exports.checkConnection = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const areConnected = await Connection.areConnected(req.user.id, userId);
    
    req.isConnected = areConnected;
    next();
  } catch (error) {
    next(error);
  }
};

// Require connection to access resource
exports.requireConnection = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    // Owner can always access
    if (userId === req.user.id) {
      return next();
    }
    
    const areConnected = await Connection.areConnected(req.user.id, userId);
    
    if (!areConnected) {
      return res.status(403).json({
        success: false,
        message: 'You must be connected to this user to access this resource'
      });
    }
    
    next();
  } catch (error) {
    next(error);
  }
};
