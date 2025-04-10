// controllers/participationController.js
const Participation = require('../models/Participation');
const Event = require('../models/Event');
const Vote = require("../models/Vote");


const getUserParticipations = async (req, res) => {
    const userId = req.params.userId

    try {
        const participants = await Participation.query()
            .select('eventId')
            .where('userId', userId)

        if (!participants) {
            return res.status(404).json({
                success: false,
                message: "No participations found"
            })
        } else {
            return res.status(200).json({
                success: true,
                data: participants
            })
        }
    } catch (error) {
        console.log(error.message ? "error: " + error.message : error);
    }
}


const addParticipationToEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user.id;
        const { arrivalDate } = req.body;

        if (!Event.query().findById(eventId)) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        const isUserRegisteredToEvent = await Participation.query()
            .select('id')
            .where('userId', userId)
            .andWhere('eventId', eventId)

        // Check if user is already registered
        if (isUserRegisteredToEvent.length !== 0) {
            return res.status(400).json({
                success: false,
                message: 'User is already registered for the event'
            })
        }

        if (!eventId || !userId) {
            let arr = [""]
            if (!eventId) {
                arr.push("Event ID");
            }
            if (!userId) {
                arr.push("User ID");
            }
            return res.status(400).json({ success: false, message: 'Missing required information: ' + arr.join(", ") });
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
        const userId = req.user.id;

        const registrations = await Participation.query().findById(id)
            .select('id', 'userId', 'eventId')
            .where('id', id);

        if (!registrations) {
            return res.status(404).json({
                success: false,
                message: "Participation not found"
            });
        }

        // Delete user's votes from event
        const deleteVotes = await Vote.query().delete()
            .where('eventId', registrations.eventId)
            .andWhere('userId', userId);

        if (!deleteVotes) {
            console.log("Unable to delete votes from user " + userId + " from event " + registrations.eventId);
        } else {
            console.log("Votes deleted from event " + registrations.eventId);
        }

        const participation = await Participation.query().deleteById(id);

        if (participation) {
            res.status(200).json({ success: true, message: 'Participation removed from event' });
        }
        else {
            res.status(404).json({ success: false, message: 'Participation not found' });
        }

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Error removing participation from event' });
    }
};

const getParticipationToEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
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

// PATCH: Set participation paid for participant
// (default: 0, participant: 1, organizerConfirmed: 2)
const setPaid = async (req, res) => {
    const id = req.params.id;
    const paidLevel = req.body.paidLevel;

    try {
        const participation = await Participation.query().findById(id);

        if (!participation) {
            return res.status(404).json({
                success: false,
                message: "Participation not found"
            })
        }

        const event = await Event.query().select('organizer')
          .where('id', participation.eventId).first();

        if (participation.userId !== req.user.id && event.organizer !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Forbidden"
            })
        }

        if (event.organizer !== req.user.id && (paidLevel === 2 || participation.paid === 2)) {
            return res.status(403).json({
                success: false,
                message: "Forbidden"
            })
        }

        const updateParticipation = await Participation.query()
          .patchAndFetchById(id, { paid: paidLevel });

        return res.status(200).json({
            success: true,
            data: updateParticipation
        })
    } catch (error) {
        console.error("Error updating participation", error.message);
        res.status(500).json({
            success: false,
            message: "Error updating participation",
            error: error.message
        })
    }
}

module.exports = {
    addParticipationToEvent,
    removeParticipationFromEvent,
    getParticipationToEvent,
    updateParticipationToEvent,
    getUserParticipations,
    setPaid
};
