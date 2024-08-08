// controllers/participationController.js
const Participation = require('../models/Participation');
const Event = require('../models/Event');

const addParticipationToEvent = async (req, res) => {
    try {
        if (!Event.query().findById(req.params.eventId)) {
            return res.status(404).json({ message: 'Event not found' });
        }
        
        const { eventId } = req.params;
        const { userId } = req.user;
        const { arrivalDate } = req.body;
        const participation = await Participation.query().insert({
        eventId,
        userId,
        arrivalDate,
        });
        res.json(participation);
    } catch (err) {
        res.status(500).json({ message: 'Error adding participation to event' });
    }
    };

const removeParticipationFromEvent = async (req, res) => {
    try {
        const { id } = req.params;
        // const { userId } = req.user;

        // tarkista myöhemmin, että käyttäjä on osallistuja ja on poistaja
 
        const participation = await Participation.query().delete().where({
        id
        });
        res.json(participation);
    } catch (err) {
        res.status(500).json({ message: 'Error removing participation from event' });
    }
};

const getParticipationToEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { userId } = req.user;

        const participation = await Participation.query().where(eventId, userId);
        res.json(participation);
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
        res.json(participation);
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