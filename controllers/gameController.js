// controllers/gameController.js
const Game = require('../models/Game');

exports.addGame = async (req, res) => {
    console.log("received POST request to /api/games");
  const { gameExternalApiId, gameName, gamePrice, gameShop, gameDescription, gameLink, gamePlayers, gameIsLan } = req.body;

  const gameSubmittedBy = req.user.id; // Assuming the user ID is stored in req.user.id after authentication

// Presetting user ID for testing purposes
// const gameSubmittedBy = 1; 

  try {
    const newGame = await Game.query().insert({
      gameExternalApiId,
      gameName,
      gamePrice,
      gameShop,
      gameDescription,
      gameLink,
      gamePlayers,
      gameIsLan,
      gameSubmittedBy
    });

    res.status(201).json({
      success: true,
      data: newGame
    });
  } catch (error) {
    console.log("error adding game", error.message);
    res.status(500).json({
      success: false,
      message: 'Error adding game',
      error: error.message
    });
  }
};
