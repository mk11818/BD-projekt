const express = require('express');

const marketController = require('../controllers/market');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/quotes', isAuth, marketController.getQuotes);

module.exports = router;
