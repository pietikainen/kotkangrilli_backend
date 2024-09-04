// gameMiddleware.js
const gameController = require('../controllers/gameController');


module.exports = {
    isSelfOrAdmin: (req, res, next) => {

        const currentUser = req.user.id;
        const gameId = req.params.id;

        const gameSubmitter = gameController.getGameSubmittedBy(gameId);

        if (currentUser === gameSubmitter || req.user.userlevel === 8 || req.user.userlevel === 9) {
            return next();
        } else {
            res.status(403).json({ message: 'Unauthorized.' });
        }
    }
}
