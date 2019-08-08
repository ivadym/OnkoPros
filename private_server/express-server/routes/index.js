const express = require('express');
const router = express.Router();

const jwtController = require('../controllers/jwtController');
const authController = require('../controllers/authController');
const entrevistasController = require('../controllers/entrevistasController');
const itemController = require('../controllers/itemController');

const ruta = '/api/';

router.post(ruta + 'auth', authController.autenticacion, jwtController.generarJWT);

router.get(ruta + 'entrevistas', jwtController.verificarJWT, entrevistasController.getEntrevistas);
router.get(ruta + 'entrevistas/:idEntrevista', jwtController.verificarJWT, entrevistasController.getEntrevista);

router.get(ruta + 'entrevistas/:idEntrevista/items', jwtController.verificarJWT, itemController.getSiguienteItem);
router.post(ruta + 'entrevistas/:idEntrevista/items', jwtController.verificarJWT, itemController.setItem);
router.get(ruta + 'entrevistas/:idEntrevista/items/:idItem', jwtController.verificarJWT, itemController.getItemRespondido);
router.post(ruta + 'entrevistas/:idEntrevista/items/:idItem', jwtController.verificarJWT, itemController.updateItem);

module.exports = router;
