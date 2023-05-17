const express = require('express');

const paymentController = require('../controllers/payment');

const router = express.Router();

router.post('/fill-wallet', paymentController.fillWallet);

module.exports = router;
