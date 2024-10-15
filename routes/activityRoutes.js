const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const {isAdmin} = require("../middleware/authMiddleware");

router.get('/events/:eventId', activityController.getActivitiesByEventId);
router.post('/events/:eventId', isAdmin, activityController.addActivity);
router.put('/:activityId', isAdmin, activityController.updateActivity);
router.delete('/:activityId', isAdmin, activityController.deleteActivity);

module.exports = router;
