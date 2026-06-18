const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, optionalAuth } = require('../middleware/auth');
const projectController = require('../controllers/projectController');

// Validation rules
const createProjectValidation = [
  body('title').trim().notEmpty().withMessage('Project title is required'),
  body('description')
    .trim()
    .notEmpty()
    .isLength({ max: 5000 })
    .withMessage('Description required (max 5000 chars)'),
  body('startDate').isISO8601().withMessage('Valid start date required'),
  body('endDate').optional().isISO8601().withMessage('Invalid end date'),
  body('category')
    .optional()
    .isIn(['software', 'design', 'marketing', 'research', 'consulting', 'other']),
  body('technologies').optional().isArray(),
  body('tags').optional().isArray(),
  body('visibility')
    .optional()
    .isIn(['public', 'connectionsOnly', 'private', 'teamOnly'])
];

const addTeamMemberValidation = [
  body('userId').isMongoId().withMessage('Valid user ID required'),
  body('role').optional().trim().notEmpty(),
  body('contribution').optional().isLength({ max: 500 })
];

// Public routes (with optional auth for visibility)
router.get('/user/:userId', projectController.getUserProjects);
router.get('/:id', optionalAuth, projectController.getProject);

// Protected routes
router.post('/', protect, createProjectValidation, projectController.createProject);
router.put('/:id', protect, projectController.updateProject);
router.delete('/:id', protect, projectController.deleteProject);

// Team management
router.post(
  '/:id/members',
  protect,
  addTeamMemberValidation,
  projectController.addTeamMember
);
router.put(
  '/:id/members/:userId/approve',
  protect,
  projectController.approveTeamMembership
);
router.put(
  '/:id/members/:userId/reject',
  protect,
  projectController.rejectTeamMembership
);
router.delete('/:id/members/:userId', protect, projectController.removeTeamMember);

// User invitations
router.get('/invitations', protect, projectController.getPendingInvitations);

module.exports = router;
