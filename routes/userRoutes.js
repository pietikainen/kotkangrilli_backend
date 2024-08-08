const express = require('express');

const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/me', authMiddleware.ensureAuthenticated, userController.getUser);
router.get('/users', authMiddleware.ensureAuthenticated, userController.getAllUsers);

module.exports = router;
