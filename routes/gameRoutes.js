// routes/gameRoutes.js
const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const configController = require('../controllers/configController');
const gameMiddleware = require('../middleware/gameMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware to check IDGB token expiry date - if old, get new.

router.use(async (req, res, next) => {
    const now = new Date();
    const data = await configController.getIgdbTokenFromConfig(req, res);

    const expiryDate = data.expiry;

    if (!expiryDate || now > expiryDate) {
        await configController.updateIgdbTokenInConfig();
    }
    next();
})

router.get('/store-url/:id', gameController.getGameStoreUrl);

// POST route to add a new game
router.post('', gameController.addGame);

// DELETE route to delete a game from suggestions
router.delete('/:id', authMiddleware.isAdmin, gameController.deleteGameSuggestion);

// GET route to get all games
router.get('', gameController.getAllGames);

router.get('/search/:param', gameController.getGameFromIgdb);
//router.get('/details/:id', gameController.getGameDetailsFromIgdb);

router.get('/cover/:id', gameController.getGameCoverFromIgdb);

router.put('/:id', gameMiddleware.isSelfOrAdmin, gameController.editGameSuggestion);


module.exports = router;
