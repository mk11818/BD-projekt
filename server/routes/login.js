const express = require('express');

const loginController = require('../controllers/login');

const router = express.Router();

router.get('/register', loginController.register);

router.get('/login', loginController.login);

module.exports = router;
