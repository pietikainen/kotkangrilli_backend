// voteController.js

const Vote = require('../models/Vote');
const Event = require('../models/Event');
const Participation = require('../models/Participation');
const GameVote = require('../models/GameVote');


// POST: Cast a vote
exports.castVote = async (req, res) => {
    const eventId = req.params.eventId;
    const userId = req.user.id;
    const externalApiId = req.body.externalApiId;

    try {
        const event = await Event.query().findById(eventId);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            })
        }

        if (event.votingState !== 2 && event.votingState !== 3) {
            return res.status(400).json({
                success: false,
                message: "Event is not open for voting"
            })
        }

        const lastRound = await GameVote.query()
          .where({ eventId })
          .max("voting_round as maxRound")
          .first();

        const votingRound = lastRound.maxRound
          ? parseInt(lastRound.maxRound) + 1
          : 1;

        const existingVotes = await Vote.query().select('id').where('userId', userId).andWhere('eventId', eventId).andWhere('voting_round', votingRound)

        if (event.winnerGamesCount <= existingVotes.length) {
            return res.status(400).json({
                success: false,
                message: "Error: Max limit reached."
            })
        }

        const checkForExisting = await Vote.query()
            .select('id')
            .where('eventId', eventId)
            .andWhere('externalApiId', externalApiId)
            .andWhere('userId', userId);

        const isUserRegistered = await Participation.query()
            .select('id')
            .where('eventId', eventId)
            .andWhere('userId', userId);

        if (isUserRegistered.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'User is not registered to the event'
            })
        }

        if (checkForExisting.length !== 0) {
            return res.status(400).json({
                success: false,
                message: "Vote already exists"
            });
        }

        const newVote = await Vote.query().insert({
            eventId,
            userId,
            externalApiId
        });

        if (!newVote) {
            return res.status(400).json({
                success: false,
                message: 'Error casting vote'
            });
        } else {
            return res.status(201).json({
                success: true,
                data: newVote
            });
        }

    } catch (error) {
        console.log("error: ", error.message);
        res.status(500).json({
            success: false,
            message: 'Error adding vote',
            error: error.message
        })
    }
}

// GET: Get users votes by Event ID

exports.getVotesByUser = async (req, res) =>  {
    const userId = req.user.id
    const eventId = req.params.eventId;

    try {

        const votes = await Vote.query()
            .where('eventId', eventId)
            .andWhere('userId', userId);

        if (!votes) {
            return res.status(404).json({
                success: false,
                message: "Error: No votes found"
            })
        }

        return res.status(200).json({
            success: true,
            data: votes
        })


    } catch (error) {
        console.log("error response data: ", error.response ? error.response.data : 'No votes found');
        return res.status(500).json({
            success: false,
            message: 'Error getting vote',
            error: error.message
        })
    }
}

// DELETE: Delete a vote by voteId
exports.deleteVote = async (req, res) => {

    const voteId = req.params.voteId;
    const userId = req.user.id;

    console.log("voteID: ", voteId);
    console.log("userId: ", userId);

    try {
        // Get the vote
        const vote = await Vote.query()
            .select('id', 'userId')
            .where('id', voteId)

        const deleteVote = await Vote.query().deleteById(voteId);
        if (deleteVote) {
            return res.status(200).json({
                success: true,
            })
        }
    } catch (error) {
        console.log("error: ", error.message);
        return res.status(500).json({
            success: false,
            message: 'Error deleting vote',
            error: error.message
        });
    }

}

exports.getGameVotesByEventId = async (req, res) => {
    const eventId = req.params.eventId;

    try {
        const gameVotes = await GameVote.query()
            .where('eventId', eventId)
            .orderBy('votes_amount', 'desc');

        if (!gameVotes) {
            return res.status(404).json({
                success: false,
                message: "Error: No game votes found"
            })
        }

        return res.status(200).json({
            success: true,
            data: gameVotes
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error getting game votes',
            error: error.message
        })
    }
}
