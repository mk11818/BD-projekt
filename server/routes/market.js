const express = require('express');

const marketController = require('../controllers/market');

const router = express.Router();

router.get('/quotes', marketController.getQuotes);

module.exports = router;
