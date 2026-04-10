// controllers/passengerController.js

const Passenger = require('../models/Passenger');
const Carpool = require('../models/Carpool');
const { transaction } = require('objection');
const {
    PAYMENT_REQUEST_TYPES,
    syncUserToPaymentRequests,
    clearOrCancelUserPaymentRequests,
    hasPaymentRequests
} = require('../services/paymentRequestService');

// GET: Passengers with Carpool ID
exports.getPassengersWithCarpoolId = async (req, res) => {
    const carpoolId = req.params.carpoolId;

    try {
        const passengers = await Passenger.query()
            .select('id', 'passengerId')
            .where('carpoolId', carpoolId)

        if (!passengers) {
        return res.status(404).json({
            success: false,
            message: "Error: Passenger not found"
        }
        )} else {
            return res.status(200).json({
                success: true,
                data: passengers
            })
        }
    } catch (error) {
        console.log("error getting passengers with carpool id")
        return res.status(500).json({
            success: false,
            message: 'Error getting passengers',
            error: error.message
        })
    }
}

// POST: Post a passenger to carpool with CID
exports.postPassenger = async (req, res) => {
    const carpoolId = req.params.carpoolId;
    const passengerId = req.user.id;

    try {
        const carpool = await Carpool.query()
            .select('id', 'eventId')
            .findById(carpoolId);

        if (!carpool) {
            return res.status(404).json({
                success: false,
                message: 'Carpool not found'
            });
        }

        const addPassenger = await transaction(Passenger.knex(), async (trx) => {
            const insertedPassenger = await Passenger.query(trx).insert({
                carpoolId,
                passengerId
            });

            await syncUserToPaymentRequests(trx, {
                type: PAYMENT_REQUEST_TYPES.RIDE,
                eventId: carpool.eventId,
                sourceId: Number(carpoolId),
                userId: passengerId
            });

            return insertedPassenger;
        });

        res.status(201).json({
            success: true,
            data: addPassenger
        })
    } catch (error) {
        console.log("Error posting passenger");
        res.status(500).json({
            success: false,
            message: 'Error posting passenger',
            error: error.message
        });
    }
}

// DELETE: Delete passenger from carpool
exports.deletePassenger = async (req, res) => {
    const id = req.params.id;

    try {
        const passenger = await Passenger.query().findById(id);

        if (!passenger) {
            return res.status(404).json({
                success: false,
                message: "Error: Passenger not found"
            })
        }

        const carpool = await Carpool.query()
            .select('eventId', 'driverId')
            .findById(passenger.carpoolId);

        if (!carpool) {
            return res.status(404).json({
                success: false,
                message: 'Carpool not found'
            });
        }

        const isAdmin = req.user.userlevel >= 8;
        const isDriver = carpool.driverId === req.user.id;
        const isSelf = passenger.passengerId === req.user.id;

        if (!isAdmin && !isDriver && !isSelf) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden'
            });
        }

        const hasPaymentRequestsForRide = await hasPaymentRequests(null, {
            type: PAYMENT_REQUEST_TYPES.RIDE,
            eventId: carpool.eventId,
            sourceId: passenger.carpoolId
        });

        if (hasPaymentRequestsForRide && !isAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Ride signup cannot be cancelled because payment requests exist for this ride'
            });
        }

        const deletePassenger = await transaction(Passenger.knex(), async (trx) => {
            await clearOrCancelUserPaymentRequests(trx, {
                type: PAYMENT_REQUEST_TYPES.RIDE,
                eventId: carpool.eventId,
                sourceId: passenger.carpoolId,
                userId: passenger.passengerId,
                cancelledBy: req.user.id
            });

            return Passenger.query(trx).deleteById(id);
        });

        if (!deletePassenger) {
            return res.status(404).json({
                success: false,
                message: "Error: Passenger not found"
            })
        }
        res.status(200).json({
            success: true,
            data: deletePassenger
        })
    } catch (error) {
        console.log("Error deleting passenger");
        res.status(500).json({
            success: false,
            message: 'Error deleting passenger',
            error: error.message
        });
    }
}
