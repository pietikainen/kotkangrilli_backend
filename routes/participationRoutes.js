// routes/participationRoutes.js

const express = require('express');
const router = express.Router();

const participationController = require('../controllers/participationController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/:eventId', participationController.addParticipationToEvent);
router.delete('/:id', authMiddleware.isSelfOrAdmin, participationController.removeParticipationFromEvent);
router.get('/:eventId', participationController.getParticipationToEvent);
router.put('/:id', authMiddleware.isSelfOrAdmin, participationController.updateParticipationToEvent);


// mieti joskus tätä, mistä sais kaikki :3
// router.get('/participations', participationController.getAllParticipations);








module.exports = router;