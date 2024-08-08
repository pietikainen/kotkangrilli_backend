// controllers/eventController.js

const Event = require('../models/Event');
const User = require('../models/User');
const Game = require('../models/Game');

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
    const { eventTitle, eventDescription, eventDate, eventLocation } = req.body;

    const eventOrganizer = req.user.id; // Assuming the user ID is stored in req.user.id after authentication

    // Presetting user ID for testing purposes
    // const eventOrganizer = 1; 

    try {
        const newEvent = await Event.query().insert({
            eventTitle,
            eventDescription,
            eventDate,
            eventLocation,
            eventOrganizer
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
    const { eventTitle, eventDescription, eventDate, eventLocation, eventLanMaster, eventPaintCompoWinner, eventOrganizer } = req.body;

    try {
        const updatedEvent = await Event.query().updateAndFetchById(eventId, {
            eventTitle,
            eventDescription,
            eventDate,
            eventLocation,
            eventLanMaster,
            eventPaintCompoWinner,
            eventOrganizer
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


