// configRoutes.js


const express = require('express');
const router = express.Router();

const configController = require('../controllers/configController');
const { isAdmin } = require("../middleware/authMiddleware");

router.get('/igdb-token', isAdmin, configController.getIgdbTokenFromConfig);
router.post('/igdb-token', isAdmin, configController.updateIgdbTokenInConfig);


module.exports = router;
