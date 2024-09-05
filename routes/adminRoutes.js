// adminRoutes.js

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');


router.use(authMiddleware.isAdmin);

// /admin/...


module.exports = router;