// routes/userRoutes.js
// /user/...

const express = require('express');

const router = express.Router();
const userController = require('../controllers/userController');
const adminMiddleware = require('../middleware/adminMiddleware');
const adminController = require('../controllers/adminController');


router.get('/me', userController.getUser);
router.get('', userController.getAllUsers);

router.get('/user-profiles', userController.getAllUserProfiles);

router.use(adminMiddleware.ensureAdmin);
router.patch('/:userId/userlevel', adminController.updateUserRole);


module.exports = router;
