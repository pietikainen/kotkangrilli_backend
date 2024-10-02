// controllers/passengerController.js

const Passenger = require('../models/Passenger');

// GET: Passengers with Carpool ID
exports.getPassengersWithCarpoolId = async (req, res) => {
    const carpoolId = req.params.carpoolId;

    try {
        const passengers = await Passenger.query()
            .select('passengerId')
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
        const addPassenger = await Passenger.query().insert({
            carpoolId,
            passengerId
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
        const deletePassenger = await Passenger.query().deleteById(id);

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