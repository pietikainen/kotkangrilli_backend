// configRoutes.js


const express = require('express');
const router = express.Router();

const configController = require('../controllers/configController');

router.get('/igdb-token', configController.getIgdbTokenFromConfig);
router.post('/igdb-token', configController.updateIgdbTokenInConfig);


module.exports = router;