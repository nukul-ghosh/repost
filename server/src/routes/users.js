const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');

// TODO: Implement user controller
router.get('/:id', optionalAuth, (req, res) => {
  res.json({ message: 'Get user profile - Coming soon' });
});

router.get('/search', protect, (req, res) => {
  res.json({ message: 'Search users - Coming soon' });
});

module.exports = router;
