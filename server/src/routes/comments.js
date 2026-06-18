const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, optionalAuth } = require('../middleware/auth');
const commentController = require('../controllers/commentController');

// Validation rules
const addCommentValidation = [
  body('content')
    .trim()
    .notEmpty()
    .isLength({ max: 2000 })
    .withMessage('Comment content required (max 2000 chars)'),
  body('parentComment')
    .optional()
    .isMongoId()
    .withMessage('Invalid parent comment ID')
];

const moderateCommentValidation = [
  body('action')
    .isIn(['approve', 'reject'])
    .withMessage('Action must be "approve" or "reject"'),
  body('reason')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Reason max 500 chars')
];

// Public routes (with optional auth)
router.get('/event/:eventId', optionalAuth, commentController.getEventComments);

// Protected routes
router.post('/:eventId', protect, addCommentValidation, commentController.addComment);
router.put('/:id', protect, commentController.updateComment);
router.delete('/:id', protect, commentController.deleteComment);
router.post('/:id/moderate', protect, moderateCommentValidation, commentController.moderateComment);
router.get('/pending', protect, commentController.getPendingComments);

module.exports = router;
