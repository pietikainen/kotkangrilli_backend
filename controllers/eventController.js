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

        // Add games to the event
        await newEvent.$relatedQuery('games').relate(eventGames);

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

exports.addLanMaster = async (req, res) => {
    console.log("received POST request to /api/events/:id/lanmaster");
    const { lanMasterId } = req.body;
    const { id } = req.params;

    try {
        const event = await Event.query().findById(id);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        const user = await User.query().findById(lanMasterId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await event.$query().patch({ eventLanMaster: lanMasterId });

        res.status(200).json({
            success: true,
            message: 'Lan master added to event'
        });
    }
    catch (error) {
        console.log("error adding lan master to event", error.message);
        res.status(500).json({
            success: false,
            message: 'Error adding lan master to event',
            error: error.message
        });
    }
}

exports.addPaintCompoWinner = async (req, res) => {
    console.log("received POST request to /api/events/:id/paintcompowinner");
    const { paintCompoWinnerId } = req.body;
    const { id } = req.params;

    try {
        const event = await Event.query().findById(id);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        const user = await User.query().findById(paintCompoWinnerId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await event.$query().patch({ eventPaintCompoWinner: paintCompoWinnerId });

        res.status(200).json({
            success: true,
            message: 'Paint compo winner added to event'
        });
    }
    catch (error) {
        console.log("error adding paint compo winner to event", error.message);
        res.status(500).json({
            success: false,
            message: 'Error adding paint compo winner to event',
            error: error.message
        });
    }
}
