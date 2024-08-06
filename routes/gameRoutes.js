// routes/gameRoutes.js
const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const authMiddleware = require('../middleware/authMiddleware');

// POST route to add a new game
router.post('/games', authMiddleware.ensureAuthenticated, gameController.addGame);

// Bypass middleware for API testing purposes
// router.post('/games', gameController.addGame);

// GET route to get all games
router.get('/games', gameController.getAllGames);




module.exports = router;
