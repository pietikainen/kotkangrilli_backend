// routes/memoRoutes.js

const memoController = require('../controllers/memoController');

const express = require('express');
const router = express.Router();

// GET: All.
router.get('/', memoController.getAllMemos);

module.exports = router;