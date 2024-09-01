const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');


// test token refresh route
router.use('/config', require('./configRoutes'));


router.use('/games', require('./gameRoutes'));
router.use(authMiddleware.ensureAuthenticated);

router.use('/events', require('./eventRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/participations', require('./participationRoutes'));


module.exports = router;