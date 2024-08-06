// routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');

// POST route to add a new event
router.post('/events', authMiddleware.ensureAuthenticated, eventController.addEvent);

// Bypass middleware for API testing purposes
// router.post('/events', eventController.addEvent);

// GET route to get all events
router.get('/events', eventController.getAllEvents);

router.patch('/events/:eventId/addLanMaster', authMiddleware.ensureAuthenticated, eventController.addLanMaster);
router.patch('/events/:eventId/addPaintCompoWinner', authMiddleware.ensureAuthenticated, eventController.addPaintCompoWinner);

module.exports = router;