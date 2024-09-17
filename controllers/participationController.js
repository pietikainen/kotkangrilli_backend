// controllers/participationController.js
const Participation = require('../models/Participation');
const Event = require('../models/Event');
const bodyParser = require('body-parser');

const addParticipationToEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { userId } = req.user;
        const { arrivalDate } = req.body;

        if (!Event.query().findById(req.params.eventId)) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        if (!eventId || !userId || !arrivalDate) {
            return res.status(400).json({ success: false, message: 'Missing required information' });
        }

        const participation = await Participation.query().insert({
            eventId,
            userId,
            arrivalDate,
        });

        console.log(participation);

        res.status(201).json(
            {
                success: true,
                message: 'Participation added to event'
            }
        );

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Error adding participation to event' });
    }
};

const removeParticipationFromEvent = async (req, res) => {
    try {
        // Destructure the participation id from the request parameters
        const { id } = req.params;
        const { userId } = req.user;

        const participant = await Participation.query().findById(id).where('userId', userId);
        const participation = await Participation.query().deleteById(id);

        // Check if req.user === userId
        if (!participant) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        if (participation) {
            res.status(200).json({ success: true, message: 'Participation removed from event' });
        }
        else {
            res.status(404).json({ success: false, message: 'Participation not found' });
        }

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error removing participation from event' });
    }
};

const getParticipationToEvent = async (req, res) => {
    try {
        const { eventId } = req.params;

        console.log(eventId);

        const participation = await Participation.query().where('eventId', eventId);

        if (!participation) {
            return res.status(404).json({ success: false, message: 'Participation not found' });
        } else {
            res.status(200).json({ success: true, data: participation });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error getting participation to event' });
    }
};


// TODO: Tää vois olla tutkittavana.
const updateParticipationToEvent = async (req, res) => {
    try {
        const { id } = req.params;
        // Halutaanko muuttaa adminina osallistujan osallistumista? user -> body (johtaa lisächeckiin)
        const { userId } = req.user;
        const { arrivalDate } = req.body;

        // Tähän vois vaikka palata myöhemmin. Onx tää restful?
        const participation = await Participation.query().patchAndFetchById(id, {
            userId,
            arrivalDate
        });
        res.status(200).json({ success: true, data: participation });
    } catch (err) {
        res.status(500).json({ message: 'Error updating participation to event' });
    }
};

module.exports = {
    addParticipationToEvent,
    removeParticipationFromEvent,
    getParticipationToEvent,
    updateParticipationToEvent
};