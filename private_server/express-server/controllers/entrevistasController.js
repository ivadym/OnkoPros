const entrevistasData = require('../models/entrevistasDB');
const { conexionPool } = require('../config/database');
const { logger } = require('../helpers/logger');

/**
 * Devuelve las entrevistas disponibles actualmente
 */
function getEntrevistas(req, res, next) {
    logger.info(req.idUsuario + ' > entrevistasController.getEntrevistas');
    
    var pool = conexionPool();
    entrevistasData.extraerEntrevistas(pool, req.idUsuario, req.idPerfil)
    .then(entrevistas => {
        if (entrevistas[0]) { // Hay al menos 1 entrevista
            res.status(200).json(entrevistas);
        } else {
            res.status(200).json(null);
        }
    })
    .catch(error => {
        logger.error(req.idUsuario + ' > entrevistasController.getEntrevistas.500');
        var err = new Error(error.message ? error.message : error);
        err.statusCode = 500; // HTTP 500 Internal Server Error
        next(err);
    })
};

/**
 * Devuelve la entrevista asociada a un usuario y perfil determinados
 */
function getEntrevista(req, res, next) {
    logger.info(req.idUsuario + ' > entrevistasController.getEntrevista');
    
    var pool = conexionPool();
    entrevistasData.extraerEntrevista(pool, req.idUsuario, req.idPerfil, req.params['idEntrevista'])
    .then(entrevista => {
        if (entrevista) {
            res.status(200).json(entrevista);
        } else {
            logger.error(req.idUsuario + ' > entrevistasController.getEntrevista.404');
            var err = new Error('Error en la obtención de una entrevista determinada');
            err.statusCode = 404; // HTTP 404 Not Found
            next(err);
        }
    })
    .catch(error => {
        logger.error(req.idUsuario + ' > entrevistasController.getEntrevista.500');
        var err = new Error(error.message ? error.message : error);
        err.statusCode = 500; // HTTP 500 Internal Server Error
        next(err);
    })
};

module.exports = { getEntrevistas, getEntrevista }
