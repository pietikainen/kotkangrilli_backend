// controllers/gameController.js
const Game = require('../models/Game');
const axios = require('axios');
const Config = require('../models/Config');

async function getIgdbTokenFromConfig() {
  const token = await Config.query().where('key', 'igdbToken');

  return token[0].value;
}

exports.getAllGames = async (req, res) => {
  console.log("received GET request to /api/games");
  try {
    const games = await Game.query();

    if (!games) {
      return res.status(404).json({
        success: false,
        message: 'No games found'
      });
    }

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
  const { externalApiId, title, image, price, store, description, link, players, isLan } = req.body;

  const submittedBy = req.user.id; // Assuming the user ID is stored in req.user.id after authentication
  console.log("SubmittedBy: " + submittedBy);
  // Presetting user ID for testing purposes
  // const gameSubmittedBy = 1;

  try {

    if (!title || !submittedBy) {
      return res.status(400).json({
        success: false,
        message: 'Missing required information'
      });
    }

    const newGame = await Game.query().insert({
      externalApiId,
      title,
      image,
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

exports.getGameFromIgdb = async (req, res) => {
  console.log("received GET request to /api/games/fetch-igdb/:param");

  const { param } = req.params;
  const clientId = process.env.IGDB_CLIENT_ID;
  const accessToken = await getIgdbTokenFromConfig();

  try {
    console.log("param: " + param);
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
      data: `fields name, cover; search "${param}"; where game_type = 0 & version_parent = null; limit 5; `
    });

    if (response.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No games found'
      });
    }

    res.status(200).json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.log("error response data: ", error.response ? error.response.data : 'No response data');

    res.status(500).json({
      success: false,
      message: 'Error fetching game from IGDB API',
      error: error.message
    });
  }
}

exports.getGameDetailsFromIgdb = async (req, res) => {
  console.log("received GET request to /api/games/details/:id");

  const { id } = req.params;
  const clientId = process.env.IGDB_CLIENT_ID;
  const accessToken = await getIgdbTokenFromConfig();

  try {
    console.log("id: " + id);
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
      data: `fields *; where id = ${id};`
    });

    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'No game found with this ID'
      });
    }

    res.status(200).json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.log("error response data: ", error.response ? error.response.data : 'No response data');

    res.status(500).json({
      success: false,
      message: 'Error fetching game from IGDB API',
      error: error.message
    });
  }
}

exports.getGameCoverFromIgdb = async (req, res) => {
  console.log("received GET request to /api/games/cover/:id");

  const { id } = req.params;
  const clientId = process.env.IGDB_CLIENT_ID;
  const accessToken = await getIgdbTokenFromConfig();

  try {
    console.log("id: " + id);
    console.log("clientId" + clientId);
    console.log("accessToken" + accessToken);

    const response = await axios({
      url: `https://api.igdb.com/v4/covers`,
      method: 'POST',
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'text/plain'
      },
      data: `fields *; where game = ${id};`
    });

    console.log("response.data: " + response.data);


    if (response.data.length === 0) {
      res.status(404).json({
        success: false,
        message: 'No cover found for this game'
      });

      return;
    }

    const coverUrl = `https://images.igdb.com/igdb/image/upload/t_cover_big/${response.data[0].image_id}.jpg`;

    res.status(200).json({
      success: true,
      data: coverUrl
    });
  } catch (error) {
    console.log("error fetching game cover from external API:", error.message);

    res.status(500).json({
      success: false,
      message: 'Error fetching game cover from external API',
      error: error.message
    });
  }
}

exports.getGameStoreUrl = async (req, res) => {


  // get store url from external API, if steam then use steam store url, if epic then use epic store url, etc.

  const id = req.params.id;
  const clientId = process.env.IGDB_CLIENT_ID;
  const accessToken = await getIgdbTokenFromConfig();

  try {
    let response = await axios({
      url: `https://api.igdb.com/v4/websites`,
      method: 'POST',
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'text/plain'
      },
      data: `fields *; where game = ${id};`
    });

    // find the store url from json data where type = 13 or 17 or 16
    // 13 = steam, 17 = gog, 16 = epic

    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'No website found with this ID'
      });
    }

    let storeUrl = '';

    for (let i = 0; i < response.data.length; i++) {
      if (response.data[i].type === 13 || response.data[i].type === 17 || response.data[i].type === 16) {
        storeUrl = response.data[i].url;
        break;
      }
    }

    // if response from websites is empty, try external_games
    if (storeUrl === '') {
      let response = await axios({
        url: `https://api.igdb.com/v4/external_games`,
        method: 'POST',
        headers: {
          'Client-ID': clientId,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'text/plain'
        },
        data: `fields *; where game = ${id};`
      });

    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'No external game found with this ID'
      });
    }

      // find the store url from json data where external_game_source = 1 or 5 or 26
      // 1 = steam, 5 = gog, 26 = epic

      for (let i = 0; i < response.data.length; i++) {
        if (response.data[i].external_game_source === 1 || response.data[i].external_game_source === 5 || response.data[i].external_game_source === 26) {
          storeUrl = response.data[i].url;
          break;
        }
      }
    }

    res.status(200).json({
      success: true,
      data: storeUrl
    });


  } catch (error) {
    console.log("error fetching game store url from external API", error.message);
    console.log("error response data: ", error.response ? error.response.data : 'No response data');
  }
}


exports.editGameSuggestion = async (req, res) => {
  const gameId = req.params.id;
  const { externalApiId, title, image, price, link, store, players, isLan, description, submittedBy } = req.body;

  try {
    const game = await Game.query().findById(gameId);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    game.externalApiId = externalApiId;
    game.title = title;
    game.image = image;
    game.price = price;
    game.link = link;
    game.store = store;
    game.players = players;
    game.isLan = isLan;
    game.description = description;
    game.submittedBy = submittedBy;

    await game.$query().patch();

    res.status(200).json({
      success: true,
      data: game
    });
  } catch (error) {
    console.log("error updating game suggestion", error.message);
    res.status(500).json({
      success: false,
      message: 'Error updating game suggestion',
      error: error.message
    });
  }
}

exports.deleteGameSuggestion = async (req, res) => {
  const gameId = req.params.id;

  try {
    const game = await Game.query().findById(gameId);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    await game.$query().delete();

    res.status(200).json({
      success: true,
      message: 'Game deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting game suggestion',
      error: error.message
    });
  }
}
