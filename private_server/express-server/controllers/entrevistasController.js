const ConnectionPool = require('tedious-connection-pool');

const configDB = require('../config/database');
const entrevistasData = require('../models/entrevistasDB');
const { logger } = require('../helpers/winston');

/**
 * Devuelve las entrevistas disponibles actualmente
 */
function getEntrevistas(req, res, next) {
    logger.info('entrevistasController.getEntrevistas');

    var pool = new ConnectionPool(configDB.pool, configDB.auth);
    
    entrevistasData.extraerEntrevistas(pool, req.idUsuario, req.idPerfil)
    .then(function(entrevistas) {
        if (entrevistas[0]) { // Hay al menos 1 entrevista
            res.status(200).json(entrevistas);
        } else {
            res.status(200).json(null);
        }
    })
    .catch(function(error) {
        logger.error('entrevistasController.getEntrevistas.500');
        var err = new Error(error.message ? error.message : error);
        err.statusCode = 500; // HTTP 500 Internal Server Error
        next(err);
    })
    .finally(function() {
        pool.drain(); // Se cierran todas las conexiones
    });
};

/**
 * Devuelve la entrevista asociada a un usuario y perfil determinados
 */
function getEntrevista(req, res, next) {
    logger.info('entrevistasController.getEntrevista');

    var pool = new ConnectionPool(configDB.pool, configDB.auth);
    
    entrevistasData.extraerEntrevista(pool, req.idUsuario, req.idPerfil, req.params['idEntrevista'])
    .then(function(entrevista) {
        if (entrevista) {
            res.status(200).json(entrevista);
        } else {
            logger.error('entrevistasController.getEntrevista.404');
            var err = new Error('Error en la obtención de una entrevista determinada');
            err.statusCode = 404; // HTTP 404 Not Found
            next(err);
        }
    })
    .catch(function(error) {
        logger.error('entrevistasController.getEntrevista.500');
        var err = new Error(error.message ? error.message : error);
        err.statusCode = 500; // HTTP 500 Internal Server Error
        next(err);
    })
    .finally(function() {
        pool.drain(); // Se cierran todas las conexiones
    });
};

module.exports = { getEntrevistas, getEntrevista }
