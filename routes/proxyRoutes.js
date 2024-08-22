// routes/proxyRoutes.js

const express = require('express');
const axios = require('axios');
const router = express.Router();
const cors = require('cors');

router.post('/', async (req, res) => {
    const url = decodeURIComponent(req.query.url);
    const data = req.body;

    console.log('URL:', url);
    console.log('Data:', data);
    console.log('Data.query:', data.query);

    const clientId = process.env.IDGB_CLIENT_ID;
    const accessToken = process.env.IDGB_ACCESS_TOKEN;

    try {
        const response = await axios({
            url: url,
            method: 'POST',
            headers: {
                'Client-ID': clientId,
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'text/plain'
            },
            data: data.query
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching data from proxy URL:', error);
        res.status(500).send('Error fetching data from proxy URL');
    }
});

module.exports = router;