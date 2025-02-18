// controllers/carpoolController.js

const Carpool = require('../models/Carpool');

exports.postCarpool = async (req, res) => {
    const { eventId, seats, departureCity, departureTime, description } = req.body;
    const driverId = req.user.id;

    try {
        const newCarpool = await Carpool.query().insert( {
            eventId,
            driverId,
            seats,
            departureCity,
            departureTime,
            description
        });

        res.status(201).json({
            success: true,
            data: newCarpool
        })
    } catch (error) {
        console.log("error adding carpool", error);
        res.status(500).json({
            success: false,
            message: 'Error adding carpool',
            error: error.message
        });
    }
}

exports.getAllCarpools = async (req, res) => {
    console.log("getAllCarpools");
    try {
        const carpools = await Carpool.query();

        res.status(200).json({
            success: true,
            data: carpools
        })

    } catch (error) {
        console.log("error getting carpools", error);
        res.status(500).json({
            success: false,
            message: 'Error getting carpools',
            error: error.message
        })
    }
}

exports.getCarpoolsWithEventId = async (req, res) => {
    const eventId = req.params.eventId;

    try {
        const carpools = await Carpool.query()
            .select('id', 'eventId', 'driverId', 'seats', 'departureCity', 'departureTime', 'description')
            .where('eventId', eventId)

        return res.status(200).json({
            success: true,
            data: carpools
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error getting carpools',
            error: error.message
        })
    }
}

exports.getCarpoolsWithUserId = async (req, res) => {
    try {
        const carpools = await Carpool.query()
            .select('id', 'eventId', 'driverId', 'seats', 'departureCity', 'departureTime', 'description')
            .where('driverId', req.user.id)

        if (!carpools) {
            return res.status(404).json({
                success: false,
                message: 'No carpools found'
            })
        } else {
            return res.status(200).json({
                success: true,
                data: carpools
            })
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error getting carpools',
            error: error.message
        })
    }
}

exports.deleteCarpool = async (req, res) => {
    const id = req.params.carpoolId;

    try {
        const deleteCarpool = await Carpool.query().deleteById(id);

        if (!deleteCarpool) {
            return res.status(400).json({
                success: false,
                message: "Could not delete carpool",
            })
        }

        return res.status(200).json({
            success: true,
        })
    } catch (error) {
        console.log("error deleting carpool", error);
        res.status(500).json({
            success: false,
            message: 'Error deleting carpool',
            error: error.message
        })
    }
}

exports.updateCarpool = async (req, res) => {
    const { eventId, seats, departureCity, departureTime, description } = req.body;
    const driverId = req.user.id;
    const carpoolId = req.params.carpoolId;

    try {
        const updateCarpool = await Carpool.query()
            .update({
                eventId,
                driverId,
                seats,
                departureCity,
                departureTime,
                description
            })
            .where('id', carpoolId)

        if (updateCarpool) {
        return res.status(200).json({
            success: true
            });
        }

    } catch (error) {
        console.log("error updating carpool", error);
        res.status(500).json({
            success: false,
            message: 'Error updating carpool',
            error: error.message
        })
    }
}
