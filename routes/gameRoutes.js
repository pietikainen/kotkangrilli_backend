// routes/gameRoutes.js
const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const configController = require('../controllers/configController');
const gameMiddleware = require('../middleware/gameMiddleware');

// Middleware to check IDGB token expiry date - if old, get new.

router.use((req, res, next) => {
    const now = new Date();
    const data = configController.getIgdbTokenFromConfig(req, res);

    const expiryDate = data.expiry;

    if (now > expiryDate) {
        configController.updateIgdbTokenInConfig();
    }
    next();
})

router.get('/store-url/:id', gameController.getGameStoreUrl);

// POST route to add a new game
router.post('', gameController.addGame);

// GET route to get all games
router.get('', gameController.getAllGames);

router.get('/search/:param', gameController.getGameFromIgdb);
//router.get('/details/:id', gameController.getGameDetailsFromIgdb);

router.get('/cover/:id', gameController.getGameCoverFromIgdb);

router.put('/:id', gameController.editGameSuggestion, gameMiddleware.isSelfOrAdmin);


module.exports = router;
