const express = require('express');
const router = express.Router();

const jwtController = require('../controllers/jwtController');
const authController = require('../controllers/authController');
const entrevistasController = require('../controllers/entrevistasController');
const itemController = require('../controllers/itemController');
const valorController = require('../controllers/valorController');

router.post('/api/auth', authController.autenticarse, jwtController.generarJWT);

router.get('/api/entrevistas', jwtController.verificarJWT, entrevistasController.getEntrevistas);
router.get('/api/entrevistas/:id', jwtController.verificarJWT, itemController.getItem);
router.post('/api/entrevistas/:id', jwtController.verificarJWT, valorController.setValor);

module.exports = router;
