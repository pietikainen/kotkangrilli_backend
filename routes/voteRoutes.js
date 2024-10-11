// voteRoutes.js

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const voteController = require('../controllers/voteController');
const {or, isAdmin, createAsyncCheck} = require("../middleware/authMiddleware");
const Vote = require("../models/Vote");

const isVoter = createAsyncCheck(async (req) => {
  const voteId = req.params.voteId;
  const vote = await Vote.query().findById(voteId);
  return vote && vote.userId === req.user.id;
});

// POST route to add a new vote
router.post('/:eventId/:gameId', voteController.castVote);

// OBS! Not for use.
// GET: Calculate votes and update winners with amount of param (int) (ADMIN ONLY)
router.get('/calculate/:limit', isAdmin, adminController.calculateVotes);
router.get('/count/:eventId', adminController.countVotesByEvent);

// GET route to get all votes per Event ID by req.user.id
router.get('/:eventId/', voteController.getVotesByUser);
// GET route to get all votes by eventID

// GET route to get all votes by gameID

// PATCH route to update a vote

// DELETE route to delete a vote
router.delete('/:voteId', or(isVoter, isAdmin), voteController.deleteVote);

module.exports = router;


