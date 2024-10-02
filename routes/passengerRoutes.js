// passengerRoutes.js

const passengerController = require('../controllers/passengerController');

const express = require('express');
const router = express.Router();

const Carpool = require("../models/Carpool");
const Passenger = require("../models/Passenger");
const { or, isAdmin, createAsyncCheck } = require("../middleware/authMiddleware");

const isDriver = createAsyncCheck(async (req) => {
    const driverId = req.user.id;
    const carpool = await Carpool.query()
        .joinRelated('passenger')
        .select('passenger.carpoolId', 'carpool.id')
        .where('carpool.driverId', driverId)

    return carpool && carpool[0].driverId === req.user.id;
});

const isPassenger = createAsyncCheck(async (req) => {
    const passengerId = req.user.id;
    const passenger = await Passenger.query()
        .where('passengerId', passengerId)

    return passenger && passenger[0].passengerId === req.user.id;
})



// GET: passengers with carpoolId
router.get('/:carpoolId', passengerController.getPassengersWithCarpoolId);

// POST:
router.post('/:carpoolId', passengerController.postPassenger);

// DELETE:
router.delete('/:id', or(isDriver, isPassenger, isAdmin), passengerController.deletePassenger);

module.exports = router;