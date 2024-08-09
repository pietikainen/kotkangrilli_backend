// routes/participationRoutes.js

const express = require('express');
const router = express.Router();

const participationController = require('../controllers/participationController');

router.post('/:eventId', participationController.addParticipationToEvent);
router.delete('/:id', participationController.removeParticipationFromEvent);
router.get('/:eventId', participationController.getParticipationToEvent);
router.put('/:id', participationController.updateParticipationToEvent);


// mieti joskus tätä, mistä sais kaikki :3
// router.get('/participations', participationController.getAllParticipations);








module.exports = router;