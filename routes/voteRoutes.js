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
router.post('/:eventId', voteController.castVote);

// POST: Calculate votes for the current voting round of a given event (ADMIN ONLY)
router.post('/:eventId/count', isAdmin, adminController.calculateVotes);

// GET route to get all votes per Event ID by req.user.id
router.get('/:eventId/', voteController.getVotesByUser);

// GET route to get gamevotes by eventID
router.get('/:eventId/results', voteController.getGameVotesByEventId);

// GET route to get all votes by externalApiId

// GET route to get all votes by externalApiId

// PATCH route to update a vote

// DELETE route to delete a vote
router.delete('/:voteId', or(isVoter, isAdmin), voteController.deleteVote);

module.exports = router;


