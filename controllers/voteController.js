// voteController.js

const Vote = require('../models/Vote');
const Event = require('../models/Event');
const Participation = require('../models/Participation');


// POST: Cast a vote
exports.castVote = async (req, res) => {
    const eventId = req.params.eventId;
    const userId = req.user.id;
    const gameId = req.params.gameId;

    try {

        const maxVotes = await Event.query().select('winnerGamesCount').where('id', eventId)
        const existingVotes = await Vote.query().select('id').where('userId', userId)

        if (maxVotes[0].winnerGamesCount <= existingVotes.length) {
            return res.status(400).json({
                success: false,
                message: "Error: Max limit reached."
            })
        }

        const checkForExisting = await Vote.query()
            .select('id')
            .where('eventId', eventId)
            .andWhere('gameId', gameId)
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
            gameId
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
