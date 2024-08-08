const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware.ensureAuthenticated);

router.use('/events', require('./eventRoutes'));
router.use('/games', require('./gameRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/participations', require('./participationRoutes'));


module.exports = router;