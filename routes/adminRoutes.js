// adminRoutes.js

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminMiddleware = require('../middleware/adminMiddleware');


router.use(adminMiddleware.ensureAdmin);

module.exports = router;