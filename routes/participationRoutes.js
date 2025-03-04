// routes/participationRoutes.js

const express = require('express');
const router = express.Router();

const participationController = require('../controllers/participationController');
const { isSelf, isAdmin, or, createAsyncCheck} = require("../middleware/authMiddleware");
const Participation = require("../models/Participation");

const isParticipant = createAsyncCheck(async (req) => {
  const participationId = req.params.id;
  const participation = await Participation.query().findById(participationId);
  return participation && participation.userId === req.user.id;
});

router.post('/:eventId', participationController.addParticipationToEvent);
router.delete('/:id', or(isParticipant, isAdmin), participationController.removeParticipationFromEvent);
router.get('/:eventId', participationController.getParticipationToEvent);
router.put('/:id', or(isParticipant, isAdmin), participationController.updateParticipationToEvent);
router.get('/user/:userId', isSelf(req => Number(req.params.userId)), participationController.getUserParticipations)
router.patch('/set-paid/:id', participationController.setPaid);

// mieti joskus tätä, mistä sais kaikki :3
// router.get('/participations', participationController.getAllParticipations);








module.exports = router;
