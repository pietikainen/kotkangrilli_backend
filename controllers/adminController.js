// adminController.js

const User = require("../models/User");
const Event = require("../models/Event");
const Game = require("../models/Game");
const Vote = require("../models/Vote");
const GameVote = require("../models/GameVote");

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
        message: "User not found",
      });
    }

    if (userlevel < 0 || userlevel > 9) {
      return res.status(400).json({
        success: false,
        message: "User level must be between 0 and 9",
      });
    }

    if (req.user.userlevel < 9) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    // user.userlevel = userlevel;
    await user.$query().patch({ userlevel });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.log("error updating user level", error.message);
    res.status(500).json({
      success: false,
      message: "Error updating user level",
      error: error.message,
    });
  }
};

// Truncate all games and votes
exports.truncateGamesAndVotes = async (req, res) => {
  try {
    // Truncate votes first because of foreign key constraint
    await Vote.query().truncate();
    await Game.query().truncate();

    res.status(200).json({
      success: true,
      message: "Votes and games truncated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting games and votes",
      error: error.message,
    });
  }
};

exports.calculateVotes = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const { winnerGamesCount } = req.body;

    const event = await Event.query().findById(eventId);

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const actualWinnerLimit = winnerGamesCount || event.winnerGamesCount;

    if (!actualWinnerLimit) {
      return res.status(400).json({
        error: "winnerGamesCount not specified or found in event.",
      });
    }

    const lastRound = await GameVote.query()
      .where({ eventId })
      .max("voting_round as maxRound")
      .first();

    const votingRound = lastRound.maxRound
      ? parseInt(lastRound.maxRound) + 1
      : 1;

    const previousWinnersCount = await GameVote.query()
      .countDistinct('externalApiId as count')
      .where({ eventId, finalized: true })
      .first();

    if (
      previousWinnersCount.count === actualWinnerLimit
    ) {
      return res
        .status(200)
        .json({
          message: "Winner limit reached for this event.",
          winners: await GameVote.query().where({
            eventId,
            voting_round: lastRound.maxRound,
            finalized: true,
          }),
        });
    }

    const votesInRound = await Vote.query()
      .where({ eventId, voting_round: votingRound })
      .count("* as count")
      .first();

    if (votesInRound.count === "0") {
      return res.status(200).json({ message: "No votes for this round." });
    }

    const gamesToProcess = await Vote.query()
      .select("externalApiId", Vote.raw("COUNT(*) as vote_count"))
      .where({ eventId, voting_round: votingRound })
      .groupBy("externalApiId");

    await Promise.all(
      gamesToProcess.map((game) => {
        let gameInfoPromise;
        if (votingRound === 1) {
          // In round 1, we pull game details from the Game table.
          gameInfoPromise = Game.query().where('externalApiId', game.externalApiId).first();
        } else {
          // For subsequent rounds, copy the game information from the previous round.
          gameInfoPromise = GameVote.query().findOne({
            externalApiId: game.externalApiId,
            eventId,
            voting_round: votingRound - 1,
          });
        }

        return gameInfoPromise.then((gameInfo) => {
          if (!gameInfo) {
            throw new Error(`Game info for externalApiId ${game.externalApiId} not found from previous round`);
          }
          return GameVote.query().insert({
            eventId,
            voting_round: votingRound,
            externalApiId: gameInfo.externalApiId,
            title: gameInfo.title,
            image: gameInfo.image,
            price: gameInfo.price,
            link: gameInfo.link,
            store: gameInfo.store,
            players: gameInfo.players,
            isLan: gameInfo.isLan,
            submittedBy: gameInfo.submittedBy,
            description: gameInfo.description,
            votes_amount: game.vote_count,
            is_winner: false,
            finalized: false, // default status for this round
          });
        });
      })
    );

    // Retrieve winners for this voting round, sorted by vote count descending
    const winners = await GameVote.query()
      .select("*")
      .where({ eventId, voting_round: votingRound })
      .orderBy("votes_amount", "desc");

    // winners that are clearly within the limit (no tie conflict)
    let finalizedWinners = [];
    // advancingWinners: winners that are tied at the cutoff and therefore not finalized
    let advancingWinners = [];

    if (winners.length === 0) {
      // Should not really happen if votes exist, but just in case...
      return res.status(200).json({ message: "No winners to process." });
    }

    if (winners.length <= actualWinnerLimit) {
      // If the number of winners is less than or equal to our limit,
      // then everyone is a clear winner and can be finalized.
      finalizedWinners = winners;
    } else {
      // More winners than our limit – now check if there is a tie at the cutoff.
      const cutoffIndex = actualWinnerLimit - 1;
      const cutoffVote = winners[cutoffIndex].votes_amount;

      // If the very next candidate has the same vote count, there’s a tie at the cutoff.
      if (winners[cutoffIndex + 1].votes_amount === cutoffVote) {
        // Find the full range (tie group) that have the same vote count as the cutoff.
        let tieStart = cutoffIndex;
        while (tieStart > 0 && winners[tieStart - 1].votes_amount === cutoffVote) {
          tieStart--;
        }
        let tieEnd = cutoffIndex;
        while (tieEnd < winners.length - 1 && winners[tieEnd + 1].votes_amount === cutoffVote) {
          tieEnd++;
        }
        // Everything above the tie group is clear.
        finalizedWinners = winners.slice(0, tieStart);
        // The entire tie group will have to advance (and will be re-voted on in the next round).
        advancingWinners = winners.slice(tieStart, tieEnd + 1);
        // (Any winners below tieEnd are irrelevant in this round.)
      } else {
        // No tie at the cutoff, so the top actualWinnerLimit winners are all finalized.
        finalizedWinners = winners.slice(0, actualWinnerLimit);
      }
    }

    await Promise.all(
      winners.map((winner) => {
        const isFinalized = finalizedWinners.some(fw => fw.id === winner.id);
        return GameVote.query()
          .update({ is_winner: true, finalized: isFinalized })
          .where("id", winner.id);
      }),
    );

    return res.status(200).json({
      votingRound,
      finalizedWinners: finalizedWinners,
      advancingWinners: advancingWinners,
    });

  } catch (error) {
    console.error("Error in calculateVotes:", error);
    res.status(500).json({
      success: false,
      message: "Error calculating votes",
      error: error.message,
    });
  }
};
