const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');


// Ensure that all routes are authenticated
router.use(authMiddleware.ensureAuthenticated);

router.use('/config', require('./configRoutes'));
router.use('/games', require('./gameRoutes'));

router.use('/events', require('./eventRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/participations', require('./participationRoutes'));
router.use('/locations', require('./locationRoutes'));

router.use(authMiddleware.isAdmin);
router.use('/admin', require('./adminRoutes'));

module.exports = router;