const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, optionalAuth } = require('../middleware/auth');
const eventController = require('../controllers/eventController');

// Validation rules
const createEventValidation = [
  body('user').isMongoId().withMessage('Valid user ID is required'),
  body('eventType')
    .isIn(['skill', 'project', 'certification', 'endorsement', 'achievement', 'education', 'experience'])
    .withMessage('Invalid event type'),
  body('title').trim().notEmpty().isLength({ max: 200 }).withMessage('Title is required (max 200 chars)'),
  body('description').optional().isLength({ max: 2000 }).withMessage('Description max 2000 chars'),
  body('eventDate').isISO8601().withMessage('Valid event date is required'),
  body('endDate').optional().isISO8601().withMessage('Invalid end date'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('visibility')
    .optional()
    .isIn(['public', 'connectionsOnly', 'private'])
    .withMessage('Invalid visibility setting')
];

const updateEventValidation = [
  body('title').optional().trim().notEmpty().isLength({ max: 200 }),
  body('description').optional().isLength({ max: 2000 }),
  body('eventDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('tags').optional().isArray(),
  body('visibility').optional().isIn(['public', 'connectionsOnly', 'private'])
];

const rejectEventValidation = [
  body('reason').optional().isLength({ max: 500 }).withMessage('Rejection reason max 500 chars')
];

// Public routes (with optional auth for privacy checks)
router.get('/user/:userId', optionalAuth, eventController.getUserEvents);
router.get('/:id', optionalAuth, eventController.getEvent);

// Protected routes
router.post('/', protect, createEventValidation, eventController.createEvent);
router.get('/pending', protect, eventController.getPendingEvents);
router.put('/:id', protect, updateEventValidation, eventController.updateEvent);
router.delete('/:id', protect, eventController.deleteEvent);
router.post('/:id/approve', protect, eventController.approveEvent);
router.post('/:id/reject', protect, rejectEventValidation, eventController.rejectEvent);

module.exports = router;
