// adminController.js

const User = require("../models/User");
const Event = require("../models/Event");
const Game = require("../models/Game");
const Vote = require("../models/Vote");
const GameVote = require("../models/GameVote");

function normalizeVoteGroup(voteGroup) {
  if (typeof voteGroup !== "string") {
    return null;
  }

  const normalized = voteGroup.trim();
  return normalized.length > 0 ? normalized : null;
}

function getCandidateKey(game, aggregateByVoteGroup) {
  const voteGroup = normalizeVoteGroup(game.voteGroup);

  if (aggregateByVoteGroup && voteGroup) {
    return `group:${voteGroup}`;
  }

  return `game:${game.externalApiId}`;
}

function buildCandidates(games, voteCountsByExternalApiId, aggregateByVoteGroup) {
  const candidates = new Map();

  for (const game of games) {
    const candidateKey = getCandidateKey(game, aggregateByVoteGroup);
    const voteGroup = normalizeVoteGroup(game.voteGroup);
    const voteCount = voteCountsByExternalApiId.get(game.externalApiId) || 0;

    if (!candidates.has(candidateKey)) {
      candidates.set(candidateKey, {
        key: candidateKey,
        title: aggregateByVoteGroup && voteGroup ? voteGroup : game.title,
        voteCount: 0,
        voteGroup,
        members: [],
        requiresDecider: aggregateByVoteGroup && Boolean(voteGroup),
      });
    }

    const candidate = candidates.get(candidateKey);
    candidate.voteCount += voteCount;
    candidate.members.push(game);
  }

  return [...candidates.values()].sort((a, b) => b.voteCount - a.voteCount);
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

  if (unresolvedRows.some((row) => row.pendingReason === "cutoff_tie")) {
    return "normal";
  }

  if (
    unresolvedRows.some((row) => row.pendingReason === "group_member_decider")
  ) {
    return "group_decider";
  }

  return "normal";
}

function countReservedGroupSlots(currentRows) {
  return new Set(
    currentRows
      .filter((row) => row.is_winner && !row.finalized)
      .filter((row) => row.pendingReason === "group_member_decider")
      .map((row) => normalizeVoteGroup(row.voteGroup))
      .filter(Boolean),
  ).size;
}

function collectAdvancingRows(rows, phase) {
  return rows
    .filter((row) => row.is_winner && !row.finalized)
    .filter((row) =>
      phase === "normal"
        ? row.pendingReason === "cutoff_tie"
        : row.pendingReason === "group_member_decider",
    );
}

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

    if (!winnerGamesCount && !event.winnerGamesCount) {
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

    const previousRoundRows = lastRound.maxRound
      ? await GameVote.query().where({ eventId })
      : [];

    const currentRows = getCurrentGameVoteRows(previousRoundRows);
    const phase = determineVotingPhase(currentRows);

    const previousWinnersCount = await GameVote.query()
      .countDistinct('externalApiId as count')
      .where({ eventId, finalized: true })
      .first();

    const finalizedWinnerCount = Number(previousWinnersCount.count || 0);
    const reservedGroupSlotCount = countReservedGroupSlots(currentRows);
    const actualWinnerLimit =
      (winnerGamesCount || event.winnerGamesCount) -
      finalizedWinnerCount -
      reservedGroupSlotCount;

    if (actualWinnerLimit <= 0 && phase !== "group_decider") {
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

    if (Number(votesInRound.count || 0) === 0) {
      return res.status(200).json({ message: "No votes for this round." });
    }

    const voteCounts = await Vote.query()
      .select("externalApiId")
      .count("* as vote_count")
      .where({ eventId, voting_round: votingRound })
      .groupBy("externalApiId");

    const voteCountsByExternalApiId = new Map(
      voteCounts.map((voteCount) => [
        voteCount.externalApiId,
        Number(voteCount.vote_count || 0),
      ]),
    );

    const aggregateByVoteGroup = phase === "normal";

    const gamesToProcess =
      votingRound === 1
        ? await Game.query().select(
            "externalApiId",
            "title",
            "image",
            "price",
            "link",
            "store",
            "players",
            "isLan",
            "submittedBy",
            "description",
            "voteGroup",
          )
        : collectAdvancingRows(currentRows, phase)
            .map((row) => ({
              externalApiId: row.externalApiId,
              title: row.title,
              image: row.image,
              price: row.price,
              link: row.link,
              store: row.store,
              players: row.players,
              isLan: row.isLan,
              submittedBy: row.submittedBy,
              description: row.description,
              voteGroup: row.voteGroup,
            }));

    const candidates = buildCandidates(
      gamesToProcess,
      voteCountsByExternalApiId,
      aggregateByVoteGroup,
    );

    if (candidates.length === 0) {
      return res.status(200).json({ message: "No winners to process." });
    }

    const candidateByKey = new Map(
      candidates.map((candidate) => [candidate.key, candidate]),
    );

    await Promise.all(
      gamesToProcess.map((game) => {
        const candidate = candidateByKey.get(
          getCandidateKey(game, aggregateByVoteGroup),
        );

        return GameVote.query().insert({
          eventId,
          voting_round: votingRound,
          externalApiId: game.externalApiId,
          title: game.title,
          image: game.image,
          price: game.price,
          link: game.link,
          store: game.store,
          players: game.players,
          isLan: game.isLan,
          submittedBy: game.submittedBy,
          description: game.description,
          voteGroup: normalizeVoteGroup(game.voteGroup),
          votes_amount: candidate ? candidate.voteCount : 0,
          is_winner: false,
          finalized: false,
        });
      }),
    );

    let finalizedCandidateKeys = new Set();
    let normalTieCandidateKeys = new Set();
    let groupDeciderCandidateKeys = new Set();

    if (phase === "normal") {
      let clearCandidates;
      let tieCandidates = [];

      if (candidates.length <= actualWinnerLimit) {
        clearCandidates = candidates;
      } else {
        const cutoffIndex = actualWinnerLimit - 1;
        const cutoffVote = candidates[cutoffIndex].voteCount;

        if (
          candidates[cutoffIndex + 1] &&
          candidates[cutoffIndex + 1].voteCount === cutoffVote
        ) {
          let tieStart = cutoffIndex;
          while (
            tieStart > 0 &&
            candidates[tieStart - 1].voteCount === cutoffVote
          ) {
            tieStart -= 1;
          }

          let tieEnd = cutoffIndex;
          while (
            tieEnd < candidates.length - 1 &&
            candidates[tieEnd + 1].voteCount === cutoffVote
          ) {
            tieEnd += 1;
          }

          clearCandidates = candidates.slice(0, tieStart);
          tieCandidates = candidates.slice(tieStart, tieEnd + 1);
        } else {
          clearCandidates = candidates.slice(0, actualWinnerLimit);
        }
      }

      finalizedCandidateKeys = new Set(
        clearCandidates
          .filter((candidate) => !candidate.requiresDecider)
          .map((candidate) => candidate.key),
      );

      normalTieCandidateKeys = new Set(
        tieCandidates.map((candidate) => candidate.key),
      );

      groupDeciderCandidateKeys = new Set(
        clearCandidates
          .filter((candidate) => candidate.requiresDecider)
          .map((candidate) => candidate.key),
      );
    } else {
      const groupedCandidates = new Map();

      for (const candidate of candidates) {
        const voteGroup = normalizeVoteGroup(candidate.voteGroup);
        if (!voteGroup) {
          finalizedCandidateKeys.add(candidate.key);
          continue;
        }

        if (!groupedCandidates.has(voteGroup)) {
          groupedCandidates.set(voteGroup, []);
        }
        groupedCandidates.get(voteGroup).push(candidate);
      }

      for (const groupCandidates of groupedCandidates.values()) {
        if (groupCandidates.length === 1) {
          finalizedCandidateKeys.add(groupCandidates[0].key);
          continue;
        }

        const topVote = groupCandidates[0].voteCount;
        const tiedCandidates = groupCandidates.filter(
          (candidate) => candidate.voteCount === topVote,
        );

        if (tiedCandidates.length === 1) {
          finalizedCandidateKeys.add(groupCandidates[0].key);
        } else {
          tiedCandidates.forEach((candidate) =>
            groupDeciderCandidateKeys.add(candidate.key),
          );
        }
      }
    }

    const winnerRows = await GameVote.query()
      .select("*")
      .where({ eventId, voting_round: votingRound })
      .orderBy("votes_amount", "desc");

    await Promise.all(
      winnerRows.map((game) => {
        const candidateKey = getCandidateKey(game, aggregateByVoteGroup);
        const isFinalized = finalizedCandidateKeys.has(candidateKey);
        const pendingReason = isFinalized
          ? null
          : normalTieCandidateKeys.has(candidateKey)
            ? "cutoff_tie"
            : groupDeciderCandidateKeys.has(candidateKey)
              ? "group_member_decider"
              : null;
        const isWinner = isFinalized || Boolean(pendingReason);

        return GameVote.query()
          .update({
            is_winner: isWinner,
            finalized: isFinalized,
            pendingReason,
          })
          .where("id", game.id);
      }),
    );

    const finalizedWinners = await GameVote.query()
      .where({ eventId, voting_round: votingRound, finalized: true })
      .orderBy("votes_amount", "desc");

    const advancingWinners = await GameVote.query()
      .where({
        eventId,
        voting_round: votingRound,
        finalized: false,
        is_winner: true,
      })
      .orderBy("votes_amount", "desc");

    return res.status(200).json({
      votingRound,
      finalizedWinners,
      advancingWinners,
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
