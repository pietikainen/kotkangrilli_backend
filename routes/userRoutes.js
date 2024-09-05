// routes/userRoutes.js
// /user/...

const express = require('express');

const router = express.Router();
const userController = require('../controllers/userController');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');


router.get('/me', userController.getUser);
router.get('/user-profiles', userController.getAllUserProfiles);


router.use(authMiddleware.isAdmin);

router.get('', userController.getAllUsers);
router.patch('/:userId/userlevel', adminController.updateUserLevel);


module.exports = router;
