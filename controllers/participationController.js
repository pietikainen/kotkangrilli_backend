// controllers/participationController.js
const Participation = require('../models/Participation');
const Event = require('../models/Event');

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

        res.status(201).json(
            {
                success: true,
                message: 'Participation added to event'
            }
        );

    } catch (err) {
        res.status(500).json({ success: false, message: 'Error adding participation to event' });
    }
};

const removeParticipationFromEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.user;

        if (!userId == id) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        if (!Participation.query().findById(id)) {
            return res.status(404).json({ success: false, message: 'Participation not found' });
        }        

        const participation = await Participation.query().delete().where(id);

        res.status(200).json({ success: true, message: 'Participation removed from event' });

    } catch (err) {
        res.status(500).json({ message: 'Error removing participation from event' });
    }
};

const getParticipationToEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { userId } = req.user;

        const participation = await Participation.query().where(eventId, userId);
        res.status(200).json({ success: true, data: participation });
    } catch (err) {
        res.status(500).json({ message: 'Error getting participation to event' });
    }
};

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