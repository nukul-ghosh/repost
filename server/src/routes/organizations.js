const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, optionalAuth } = require('../middleware/auth');
const organizationController = require('../controllers/organizationController');

// Validation rules
const createOrganizationValidation = [
  body('name').trim().notEmpty().withMessage('Organization name is required'),
  body('tagline').optional().isLength({ max: 200 }),
  body('description').optional().isLength({ max: 5000 }),
  body('email').optional().isEmail(),
  body('website').optional().isURL()
];

const addEmployeeValidation = [
  body('userId').isMongoId().withMessage('Valid user ID required'),
  body('position').optional().trim(),
  body('department').optional().trim(),
  body('joinedAt').optional().isISO8601()
];

const addAdminValidation = [
  body('userId').isMongoId().withMessage('Valid user ID required'),
  body('role')
    .optional()
    .isIn(['admin', 'moderator'])
    .withMessage('Role must be admin or moderator')
];

// Public routes
router.get('/', organizationController.getAllOrganizations);
router.get('/search', organizationController.searchOrganizations);
router.get('/:id', optionalAuth, organizationController.getOrganization);
router.get('/:id/employees', optionalAuth, organizationController.getEmployees);
router.get('/:id/projects', optionalAuth, organizationController.getOrganizationProjects);

// Protected routes
router.post('/', protect, createOrganizationValidation, organizationController.createOrganization);
router.put('/:id', protect, organizationController.updateOrganization);
router.delete('/:id', protect, organizationController.deleteOrganization);

// Employee management
router.post('/:id/employees', protect, addEmployeeValidation, organizationController.addEmployee);
router.delete('/:id/employees/:userId', protect, organizationController.removeEmployee);
router.put('/:id/employees/:userId/verify', protect, organizationController.verifyEmployee);

// Admin management
router.post('/:id/admins', protect, addAdminValidation, organizationController.addAdmin);
router.delete('/:id/admins/:userId', protect, organizationController.removeAdmin);

module.exports = router;
