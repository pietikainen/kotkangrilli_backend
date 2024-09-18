// voteRoutes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');
const voteController = require('../controllers/voteController');

// POST route to add a new vote
router.post('/:eventId/:gameId', voteController.castVote);

// OBS! Not for use.
// GET: Calculate votes and update winners with amount of param (int) (ADMIN ONLY)
router.get('/calculate/:limit', authMiddleware.isAdmin, adminController.calculateVotes);

// GET route to get all votes by userID

// GET route to get all votes by eventID

// GET route to get all votes by gameID

// PATCH route to update a vote

// DELETE route to delete a vote
router.delete('/:voteId', voteController.deleteVote);

module.exports = router;


