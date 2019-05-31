const ConnectionPool = require('tedious-connection-pool');

const configDB = require('../config/database');
const itemData = require('../models/itemDB');
const { logger } = require('../helpers/winston');

/**
 * Devuelve la siguiente pregunta disponible
 */
function getSiguienteItem(req, res, next) {
    logger.info('itemController.getsiguienteItem');

    var pool = new ConnectionPool(configDB.pool, configDB.auth);
    
    itemData.extraerSiguienteItem(pool, req.idUsuario, req.idPerfil, req.params['idEntrevista']) // Extrae el siguiente item disponible
    .then(function(item) {
        if (item) {
            return itemData.extraerIdItemsRespondidos(pool, req.idUsuario, req.idPerfil, req.params['idEntrevista'])
            .then(function(idItemsRespondidos) {
                res.status(200).json({
                    item: item,
                    idItemsRespondidos: idItemsRespondidos
                });
            })
        } else {
            res.status(200).json(null);
        }
    })
    .catch(function(error) {
        logger.error('itemController.getsiguienteItem.500');
        var err = new Error(error.message ? error.message : error);
        err.statusCode = 500; // HTTP 500 Internal Server Error
        next(err);
    })
    .finally(function() {
        pool.drain(); // Se cierran todas las conexiones
    });
};

/**
 * Devuelve el item respondido y asociado a un ID determinado
 */
function getItemRespondido(req, res, next) {
    logger.info('itemController.getItemRespondido');

    var pool = new ConnectionPool(configDB.pool, configDB.auth);
    
    itemData.extraerItemRespondido(pool, req.idUsuario, req.idPerfil, req.params['idEntrevista'], req.params['idItem'])
    .then(function(item) {
        return itemData.extraerIdItemsRespondidos(pool, req.idUsuario, req.idPerfil, req.params['idEntrevista'])
        .then(function(idItemsRespondidos) {
            res.status(200).json({
                item: item,
                idItemsRespondidos: idItemsRespondidos
            });
        })
    })
    .catch(function(error) {
        logger.error('itemController.getItemRespondido.500');
        var err = new Error(error.message ? error.message : error);
        err.statusCode = 500; // HTTP 500 Internal Server Error
        next(err);
    })
    .finally(function() {
        pool.drain(); // Se cierran todas las conexiones
    });
};

/**
 * Guarda la respuesta del usuario en la base de datos
 */
function setItem(req, res, next) {
    logger.info('itemController.setItem');

    var pool = new ConnectionPool(configDB.pool, configDB.auth);
    
    itemData.almacenarItem(pool, req.idUsuario, req.idPerfil, req.body)
    .then(function(item) {
        res.status(201).json(item);
    })
    .catch(function(error) {
        logger.error('itemController.setItem.500');
        var err = new Error(error.message ? error.message : error);
        err.statusCode = 500; // HTTP 500 Internal Server Error
        next(err);
    })
    .finally(function() {
        pool.drain(); // Se cierran todas las conexiones
    });
};

/**
 * Actualiza la respuesta del usuario en la base de datos
 */
function updateItem(req, res, next) {
    logger.info('itemController.updateItem');
    
    var pool = new ConnectionPool(configDB.pool, configDB.auth);
    
    itemData.actualizarItem(pool, req.idUsuario, req.idPerfil, req.body)
    .then(function(item) {
        res.status(201).json(item);
    })
    .catch(function(error) {
        logger.error('itemController.updateItem.500');
        var err = new Error(error.message ? error.message : error);
        err.statusCode = 500; // HTTP 500 Internal Server Error
        next(err);
    })
    .finally(function() {
        pool.drain(); // Se cierran todas las conexiones
    });
};

module.exports = { getSiguienteItem, getItemRespondido, setItem, updateItem }
