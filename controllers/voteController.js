// voteController.js

const Vote = require('../models/Vote');
const Event = require('../models/Event');
const Participation = require('../models/Participation');
const GameVote = require('../models/GameVote');
const Game = require('../models/Game');

function normalizeVoteGroup(voteGroup) {
    if (typeof voteGroup !== 'string') {
        return null;
    }

    const normalized = voteGroup.trim();
    return normalized.length > 0 ? normalized : null;
}

function getCurrentGameVoteRows(rows) {
    const latestRowsByGame = new Map();

    for (const row of rows) {
        const existingRow = latestRowsByGame.get(row.externalApiId);

        if (!existingRow || row.voting_round > existingRow.voting_round) {
            latestRowsByGame.set(row.externalApiId, row);
        }
    }

    return [...latestRowsByGame.values()];
}

function determineVotingPhase(currentRows) {
    const unresolvedRows = currentRows.filter(
        (row) => row.is_winner && !row.finalized,
    );

    if (unresolvedRows.some((row) => row.pendingReason === 'cutoff_tie')) {
        return 'normal';
    }

    if (unresolvedRows.some((row) => row.pendingReason === 'group_member_decider')) {
        return 'group_decider';
    }

    return 'normal';
}

function countReservedGroupSlots(rows) {
    return new Set(
        rows
            .filter((row) => row.is_winner && !row.finalized)
            .filter((row) => row.pendingReason === 'group_member_decider')
            .map((row) => normalizeVoteGroup(row.voteGroup))
            .filter(Boolean),
    ).size;
}

function collectAdvancingRows(rows, phase) {
    return rows
        .filter((row) => row.is_winner && !row.finalized)
        .filter((row) =>
            phase === 'normal'
                ? row.pendingReason === 'cutoff_tie'
                : row.pendingReason === 'group_member_decider',
        );
}


// POST: Cast a vote
exports.castVote = async (req, res) => {
    const eventId = req.params.eventId;
    const userId = req.user.id;
    const externalApiId = req.body.externalApiId;

    try {
        const event = await Event.query().findById(eventId);
        const game = await Game.query().findOne({ externalApiId });

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            })
        }

        if (!game) {
            return res.status(404).json({
                success: false,
                message: "Game not found"
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

        const previousRoundRows = lastRound.maxRound
            ? await GameVote.query().where({ eventId })
            : [];

        const currentRows = getCurrentGameVoteRows(previousRoundRows);
        const phase = determineVotingPhase(currentRows);
        const advancingRows = collectAdvancingRows(currentRows, phase);
        const eligibleExternalApiIds = new Set(
            votingRound === 1
                ? []
                : advancingRows.map((row) => row.externalApiId),
        );

        const existingVotes = await Vote.query()
            .alias('v')
            .leftJoin('games as g', 'g.externalApiId', 'v.externalApiId')
            .select('v.id', 'v.externalApiId', 'g.voteGroup')
            .where('userId', userId)
            .andWhere('v.eventId', eventId)
            .andWhere('v.voting_round', votingRound);

        const finalizedGames = await GameVote.query()
            .select('externalApiId')
            .where('eventId', eventId)
            .andWhere('finalized', true);

        const reservedGroupSlots = countReservedGroupSlots(currentRows);

        const maxVotes = phase === 'group_decider'
            ? reservedGroupSlots
            : event.winnerGamesCount - finalizedGames.length - reservedGroupSlots;

        const checkForExisting = await Vote.query()
            .select('id')
            .where('eventId', eventId)
            .andWhere('externalApiId', externalApiId)
            .andWhere('userId', userId)
            .andWhere('voting_round', votingRound);

        const voteGroup = normalizeVoteGroup(game.voteGroup);

        let existingGroupVote = [];

        if (voteGroup) {
            existingGroupVote = await Vote.query()
                .alias('v')
                .join('games as g', 'g.externalApiId', 'v.externalApiId')
                .select('v.id')
                .where('v.eventId', eventId)
                .andWhere('v.userId', userId)
                .andWhere('v.voting_round', votingRound)
                .andWhere('g.voteGroup', voteGroup);
        }

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

        if (existingGroupVote.length !== 0) {
            return res.status(400).json({
                success: false,
                message: "Vote already exists for this group"
            });
        }

        if (votingRound > 1 && !eligibleExternalApiIds.has(externalApiId)) {
            return res.status(400).json({
                success: false,
                message: "Game is not eligible for voting in this round"
            });
        }

        const usedVoteSlots = phase === 'group_decider'
            ? new Set(
                existingVotes.map((vote) =>
                    normalizeVoteGroup(vote.voteGroup) || `game:${vote.externalApiId}`,
                ),
            ).size
            : existingVotes.length;

        if (maxVotes <= usedVoteSlots) {
            return res.status(400).json({
                success: false,
                message: "Error: Max limit reached."
            })
        }

        const newVote = await Vote.query().insert({
            eventId,
            userId,
            externalApiId,
            voting_round: votingRound
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
        const vote = await Vote.query()
            .select('eventId', 'voting_round')
            .where('id', voteId).first();

        if (!vote) {
            return res.status(404).json({
                success: false,
                message: "Vote not found"
            })
        }

        const lastRound = await GameVote.query()
          .where('eventId', vote.eventId)
          .max("voting_round as maxRound")
          .first();

        const votingRound = lastRound.maxRound
          ? parseInt(lastRound.maxRound) + 1
          : 1;

        if (vote.voting_round !== votingRound) {
            return res.status(400).json({
                success: false,
                message: "Removing votes from previous rounds is not allowed"
            })
        }

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
