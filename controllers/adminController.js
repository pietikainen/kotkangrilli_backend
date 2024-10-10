// adminController.js

const User = require('../models/User');
const Event = require('../models/Event');
const Location = require('../models/Location');
const Game = require('../models/Game');
const Participation = require('../models/Participation');
const Vote = require('../models/Vote');


// Update user level
exports.updateUserLevel = async (req, res) => {
    console.log("received PATCH request to /api/admin/user/:userId");
    const userId = req.params.userId;
    const { userlevel } = req.body;

    try {
        const user = await User.query().findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (userlevel < 0 || userlevel > 9) {
            return res.status(400).json({
                success: false,
                message: 'User level must be between 0 and 9'
            });
        }

        if (req.user.userlevel < 9) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden'
            });
        }

        // user.userlevel = userlevel; 
        await user.$query().patch({ userlevel });

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.log("error updating user level", error.message);
        res.status(500).json({
            success: false,
            message: 'Error updating user level',
            error: error.message
        });
    }
}

// Truncate all games and votes
exports.truncateGamesAndVotes = async (req, res) => {
    try {        
        // Truncate votes first because of foreign key constraint
        await Vote.query().truncate();
        await Game.query().truncate();

        res.status(200).json({
            success: true,
            message: 'Votes and games truncated'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting games and votes',
            error: error.message
        });
    }
}


// OBS! Not for use.
exports.calculateVotes = async (req, res) => {
    try {

        const winnerLimit = req.params.winnerLimit || 4;

        const votes = await Vote.query();

        // Get most voted games
        const winners = await Vote.query().select('gameId').count('gameId as votes').groupBy('gameId').orderBy('votes', 'desc').limit(winnerLimit);

        // Get the most voted games from games table
        const games = await Game.query().findByIds(winners.map(winner => winner.gameId));

        // Add the votes to the games
        games.forEach(game => {
            const title = games.find(game => game.id === winner.gameId);
            title.votes_amount = winners.find(winner => winner.gameId === game.id).votes;
        });

        console.log(games);


        return res.status(200).json(winners);

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error calculating votes',
            error: error.message
        });
    }
}

// Function to get all votes combined with game data, by event ID

exports.countVotesByEvent = async (req, res) => {
    const eventId = req.params.eventId;

    try {
        const votes = await Vote.query()
        .select('gameId')
            .where('eventId', eventId)
            .count('gameId as votes')
            .groupBy('gameId');

        if (!votes) {
            return res.status(404).json({
                success: false,
                message: 'Votes not found'
            });
        }
        res.status(200).json({
            success: true,
            data: votes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error getting votes by event',
            error: error.message
        });
    }
}