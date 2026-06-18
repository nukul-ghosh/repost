const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const starController = require('../controllers/starController');

// Protected routes (require authentication)
router.post('/:eventId', protect, starController.starEvent);
router.delete('/:eventId', protect, starController.unstarEvent);
router.get('/:eventId/check', protect, starController.checkStarStatus);

// Public routes
router.get('/event/:eventId', starController.getEventStars);
router.get('/user/:userId/given', starController.getStarsGivenByUser);
router.get('/user/:userId/received', starController.getStarsReceivedByUser);

module.exports = router;
