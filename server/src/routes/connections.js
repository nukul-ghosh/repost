const express = require('express');
const router = express.Router();
const connectionController = require('../controllers/connectionController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.post('/request', connectionController.sendConnectionRequest);
router.get('/requests/received', connectionController.getReceivedRequests);
router.get('/requests/sent', connectionController.getSentRequests);
router.put('/:id/accept', connectionController.acceptConnection);
router.put('/:id/reject', connectionController.rejectConnection);
router.delete('/:id', connectionController.removeConnection);
router.get('/my-connections', connectionController.getMyConnections);
router.get('/mutual/:userId', connectionController.getMutualConnections);

// Watch/Follow functionality
router.post('/watch/user/:userId', connectionController.watchUser);
router.post('/watch/organization/:orgId', connectionController.watchOrganization);
router.delete('/watch/user/:userId', connectionController.unwatchUser);
router.delete('/watch/organization/:orgId', connectionController.unwatchOrganization);
router.get('/watching', connectionController.getWatching);
router.get('/watchers', connectionController.getWatchers);

module.exports = router;
