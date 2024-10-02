// carpoolRoutes.js

const carpoolController = require('../controllers/carpoolController');

const express = require('express');
const {or, isAdmin, createAsyncCheck} = require("../middleware/authMiddleware");
const router = express.Router();
const Carpool = require("../models/Carpool");


const isDriver = createAsyncCheck(async (req) => {
    const driverId = req.user.id;
    const carpool = await Carpool.query()
        .where('driverId', driverId)

    return carpool && carpool[0].driverId === req.user.id;
});

// POST: Driver to create carpool
router.post('/', carpoolController.postCarpool);

// GET: Get all carpools
router.get('/', carpoolController.getAllCarpools);

// GET: Get all carpools with EventId
router.get('/:eventId', carpoolController.getCarpoolsWithEventId);

// GET: Get all carpools with UserId
router.get('/driver/me', carpoolController.getCarpoolsWithUserId);

// DELETE: Delete carpool with carpoolId
router.delete('/:carpoolId', or(isDriver, isAdmin), carpoolController.deleteCarpool);

// PUT: Update entire carpool
router.put('/:carpoolId', or(isDriver, isAdmin), carpoolController.updateCarpool);

module.exports = router;