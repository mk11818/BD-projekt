const express = require('express');

const marketController = require('../controllers/market');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/quotes', isAuth, marketController.getQuotes);

router.get('/quote/:id', isAuth, marketController.getQuote);

module.exports = router;
