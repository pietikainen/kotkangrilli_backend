// configController.js

const Config = require('../models/Config');
const axios = require('axios');



// get token from config table

exports.getIgdbTokenFromConfig = async (req, res) => {
    console.log("start getIgdbTokenFromConfig");


    // get token and expiry from config table, where key = idgbToken and key = idgbTokenExpires:
    try {
        const token = await Config.query().where('key', 'igdbToken');
        const expiry = await Config.query().where('key', 'igdbTokenExpires');

        if (token.length === 0 || expiry.length === 0) {
            return {
                token: null,
                expiry: null
            }
        }

        return {
            token: token[0].value,
            expiry: expiry[0].value
        };

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error getting token from config table',
            error: error.message
        });
    }
};

exports.updateIgdbTokenInConfig = async (req, res) => {
    console.log("start updateTokenInConfig");

    try {

        // get new token from IGDB with axios

        const response = await axios({
            url: 'https://id.twitch.tv/oauth2/token?client_id=' +
            process.env.IGDB_CLIENT_ID + '&client_secret=' +
            process.env.IGDB_CLIENT_SECRET + '&grant_type=client_credentials',
            method: 'post'
        });

        // update token and expiry in config table, where key = idgbToken

        const token = response.data.access_token;
        const expiry = response.data.expires_in * 1000 + Date.now();

        await Config.query()
            .insert({ key: 'igdbToken', value: token})
            .onConflict('key')
            .merge();

        await Config.query()
            .insert({ key: 'igdbTokenExpires', value: expiry})
            .onConflict('key')
            .merge();

    } catch (error) {
        console.log("error updating token in config table", error.message);
        res.status(500).json({
            success: false,
            message: 'Error updating token in config table',
            error: error.message
        });
    }
};
