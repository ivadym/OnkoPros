const express = require('express');
const router = express.Router();

const forwardController = require('../controllers/forwardController');

router.all('*', forwardController.reenviar);

module.exports = router;
