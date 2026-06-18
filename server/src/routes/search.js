const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const { searchLimiter } = require('../middleware/rateLimiter');
const searchController = require('../controllers/searchController');

// Apply rate limiting to all search routes
router.use(searchLimiter);

// Public routes (with optional auth for personalization)
router.get('/', optionalAuth, searchController.universalSearch);
router.get('/users', optionalAuth, searchController.searchUsers);
router.get('/projects', optionalAuth, searchController.searchProjects);
router.get('/organizations', optionalAuth, searchController.searchOrganizations);
router.get('/advanced', optionalAuth, searchController.advancedSearch);

// Autocomplete/suggestions
router.get('/skills', searchController.suggestSkills);
router.get('/technologies', searchController.suggestTechnologies);

module.exports = router;
