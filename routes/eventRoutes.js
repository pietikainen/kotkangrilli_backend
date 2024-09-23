// routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const Event = require('../models/Event');
const { createAsyncCheck, or, isAdmin } = require("../middleware/authMiddleware");

const isOrganizer = createAsyncCheck(async (req) => {
  const eventId = req.params.eventId;
  const event = await Event.query().findById(eventId);
  return event && event.organizer === req.user.id;
});

// POST route to add a new event
router.post('', eventController.addEvent);

// Bypass middleware for API testing purposes
// router.post('/events', eventController.addEvent);

// GET route to get all events
router.get('', eventController.getAllEvents);
router.get('/:eventId', eventController.getEventById);
router.post('/add', eventController.addEvent);

router.patch('/add', or(isOrganizer, isAdmin), eventController.addWinners);
router.put('/:eventId', or(isOrganizer, isAdmin), eventController.updateEvent);

router.delete('/:eventId', or(isOrganizer, isAdmin), eventController.deleteEvent);

module.exports = router;
