// routes/gameRoutes.js
const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

// POST route to add a new game
router.post('', gameController.addGame);

// Bypass middleware for API testing purposes
// router.post('/games', gameController.addGame);

// GET route to get all games
router.get('', gameController.getAllGames);




module.exports = router;
