const express = require('express');

const marketController = require('../controllers/market');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/quotes', isAuth, marketController.getQuotes);
router.get('/quote/:id', isAuth, marketController.getQuote);
router.get('/quote-history/:id', isAuth, marketController.getQuoteHistory);

router.get('/orders', isAuth, marketController.getOrders);
router.get('/orders-history', isAuth, marketController.getOrdersHistory);
router.post('/create-order', isAuth, marketController.createOrder);
router.post('/delete-order', isAuth, marketController.deleteOrder);

router.get('/open-positions', isAuth, marketController.getOpenPositions);
router.get('/open-positions/:id', isAuth, marketController.getOpenPosition);
router.get('/closed-positions', isAuth, marketController.getClosedPositions);

module.exports = router;
