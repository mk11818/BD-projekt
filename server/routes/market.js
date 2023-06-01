const express = require('express');

const marketController = require('../controllers/market');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/quotes', isAuth, marketController.getQuotes);
router.get('/quote/:id', isAuth, marketController.getQuote);

router.post('/instant-buy', isAuth, marketController.instantBuy);

router.get('/orders', isAuth, marketController.getOrders);
router.post('/create-order', isAuth, marketController.createOrder);
router.post('/delete-order', isAuth, marketController.deleteOrder);

router.get('/open-positions', isAuth, marketController.getOpenPositions);
router.get('/closed-positions', isAuth, marketController.getClosedPositions);

module.exports = router;
