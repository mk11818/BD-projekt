const express = require('express');

const paymentController = require('../controllers/payment');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/wallet', isAuth, paymentController.getWallet);

router.post('/fill-wallet', isAuth, paymentController.depositFunds);

router.get('/deposit-history', isAuth, paymentController.getDepositHistory);

module.exports = router;
