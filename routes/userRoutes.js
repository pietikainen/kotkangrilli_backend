// routes/userRoutes.js
// /user/...

const express = require('express');

const router = express.Router();
const userController = require('../controllers/userController');

router.get('/me', userController.getUser);
router.get('', userController.getAllUsers);

router.get('/user-profiles', userController.getAllUserProfiles);

module.exports = router;
