// controllers/eventController.js

const Event = require('../models/Event');


exports.getAllEvents = async (req, res) => {
    console.log("received GET request to /api/events");
    try {
        const events = await Event.query();
        res.status(200).json({
            success: true,
            data: events
        });
    } catch (error) {
        console.log("error getting events", error.message);
        res.status(500).json({
            success: false,
            message: 'Error getting events',
            error: error.message
        });
    }
}

exports.addEvent = async (req, res) => {
    console.log("received POST request to /api/events");
    const { title, description, location, winnerGamesCount, startDate, endDate, votingOpen, active, lanMaster, paintCompoWinner, organizer } = req.body;

    try {
        const newEvent = await Event.query().insert({
            title,
            description,
            location,
            winnerGamesCount,
            startDate,
            endDate,
            votingOpen,
            active,
            lanMaster,
            paintCompoWinner,
            organizer: organizer || req.user.id
        });

        res.status(201).json({
            success: true,
            data: newEvent
        });
    } catch (error) {
        console.log("error adding event", error.message);
        res.status(500).json({
            success: false,
            message: 'Error adding event',
            error: error.message
        });
    }
}

exports.updateEvent = async (req, res) => {
    console.log("received PUT request to /api/events/:eventId");
    const eventId = req.params.eventId;
    const { title, description, location, startDate, endDate, winnerGamesCount, votingOpen, active, lanMaster, paintCompoWinner, organizer } = req.body;

    try {
        const updatedEvent = await Event.query().updateAndFetchById(eventId, {
            title,
            description,
            location,
            startDate,
            endDate,
            winnerGamesCount,
            votingOpen,
            active,
            lanMaster,
            paintCompoWinner,
            organizer: organizer || req.user.id
        });

        res.status(200).json({
            success: true,
            data: updatedEvent
        });
    } catch (error) {
        console.log("error updating event", error.message);
        res.status(500).json({
            success: false,
            message: 'Error updating event',
            error: error.message
        });
    }
}

exports.addWinners = async (req, res) => {
    console.log("received PUT request to /api/events/:eventId/winners");
    const eventId = req.params.eventId;
    const { lanMaster, paintCompoWinner } = req.body;

    try {
        const updatedEvent = await Event.query().updateAndFetchById(eventId, {
            lanMaster,
            paintCompoWinner
        });

        res.status(200).json({
            success: true,
            data: updatedEvent
        });
    } catch (error) {
        console.log("error updating event winners", error.message);
        res.status(500).json({
            success: false,
            message: 'Error updating event winners',
            error: error.message
        });
    }
}

exports.getEventById = async (req, res) => {
    console.log("received GET request to /api/events/:eventId");
    const eventId = req.params.eventId;

    try {
        const event = await Event.query().findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }
        res.status(200).json({
            success: true,
            data: event
        });
    } catch (error) {
        console.log("error getting event", error.message);
        res.status(500).json({
            success: false,
            message: 'Error getting event',
            error: error.message
        });
    }
}

exports.deleteEvent = async (req, res) => {
    console.log("received DELETE request to /api/events/:eventId");
    const eventId = req.params.eventId;

    try {
        await Event.query().deleteById(eventId);
        res.status(200).json({
            success: true,
            message: 'Event deleted'
        });
    } catch (error) {
        console.log("error deleting event", error.message);
        res.status(500).json({
            success: false,
            message: 'Error deleting event',
            error: error.message
        });
    }
}
