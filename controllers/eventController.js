// controllers/eventController.js

const Event = require('../models/Event');
const User = require('../models/User');
const Game = require('../models/Game');

// REFERENCE
// table.increments('id').primary();
// table.string('title').notNullable();
// table.string('description');
// table.integer('location').unsigned().notNullable().references('id').inTable('locations');
// table.date('startDate').notNullable();
// table.date('endDate').notNullable();
// table.boolean('votingOpen').defaultTo(false);
// table.boolean('active').defaultTo(false);
// table.integer('lanMaster').unsigned().references('id').inTable('users');
// table.integer('paintCompoWinner').unsigned().references('id').inTable('users');
// table.integer('organizer').unsigned().notNullable();



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


    // Give the event a default value of false for votingOpen and active
    // other fields are required

    try {
        const newEvent = await Event.query().insert({
            title,
            description,
            location,
            startDate,
            endDate,
            organizer
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
    const { eventTitle, eventDescription, eventDate, eventLocation, eventOrganizer } = req.body;

    try {
        const updatedEvent = await Event.query().updateAndFetchById(eventId, {
            title: eventTitle,
            description: eventDescription,
            location: eventLocation,
            startDate: eventDate,
            endDate: eventDate,
            organizer: eventOrganizer
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
