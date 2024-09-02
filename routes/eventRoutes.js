// routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// POST route to add a new event
router.post('', eventController.addEvent);

// Bypass middleware for API testing purposes
// router.post('/events', eventController.addEvent);

// GET route to get all events
router.get('', eventController.getAllEvents);
router.get('/:eventId', eventController.getEventById);
router.post('/add', eventController.addEvent);

router.patch('/add', eventController.addWinners);
router.put('/:eventId', eventController.updateEvent);

router.delete('/:eventId', eventController.deleteEvent);

module.exports = router;