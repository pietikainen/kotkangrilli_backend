// controllers/gameController.js
const Game = require('../models/Game');
const axios = require('axios');

exports.getAllGames = async (req, res) => {
    console.log("received GET request to /api/games");
  try {
    const games = await Game.query();
    res.status(200).json({
      success: true,
      data: games
    });
  } catch (error) {
    console.log("error getting games", error.message);
    res.status(500).json({
      success: false,
      message: 'Error getting games',
      error: error.message
    });
  }
}

exports.addGame = async (req, res) => {
    console.log("received POST request to /api/games");
  const { externalApiId, title, price, store, description, link, players, isLan } = req.body;

  const submittedBy = req.user.id; // Assuming the user ID is stored in req.user.id after authentication
  console.log("SubmittedBy: " + submittedBy);
// Presetting user ID for testing purposes
// const gameSubmittedBy = 1; 

  try {
    const newGame = await Game.query().insert({
      externalApiId,
      title,
      price,
      store,
      description,
      link,
      players,
      isLan,
      submittedBy
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

exports.fetchGameFromExternalApi = async (req, res) => {
  console.log("received GET request to /api/games/fetch-igdb/:param");

  const { param } = req.params;
  const clientId = process.env.IGDB_CLIENT_ID;
  const accessToken = process.env.IGDB_ACCESS_TOKEN;

  try {
    console.log("param" + param);
    console.log("clientId" + clientId);
    console.log("accessToken" + accessToken);
    
    const response = await axios({
      url: `https://api.igdb.com/v4/games`,
      method: 'POST',
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'text/plain'
      },
      data: `fields name, cover, price, store, link; search "${param}";`
    });   

    res.status(200).json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.log("error fetching game from external API", error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching game from external API',
      error: error.message
    });



  }

}

