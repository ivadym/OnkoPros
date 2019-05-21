const express = require('express');
const router = express.Router();

const jwtController = require('../controllers/jwtController');
const authController = require('../controllers/authController');
const entrevistasController = require('../controllers/entrevistasController');
const itemController = require('../controllers/itemController');

router.post('/api/auth', authController.autenticacion, jwtController.generarJWT);

router.get('/api/entrevistas', jwtController.verificarJWT, entrevistasController.getEntrevistas);
router.get('/api/entrevistas/:idEntrevista', jwtController.verificarJWT, entrevistasController.getEntrevista);
router.get('/api/entrevistas/:idEntrevista/items', jwtController.verificarJWT, itemController.getSiguienteItem);
router.post('/api/entrevistas/:idEntrevista/items', jwtController.verificarJWT, itemController.setItem);
router.get('/api/entrevistas/:idEntrevista/items/:idItem', jwtController.verificarJWT, itemController.getItemRespondido);
router.post('/api/entrevistas/:idEntrevista/items/:idItem', jwtController.verificarJWT, itemController.updateItem);

module.exports = router;
