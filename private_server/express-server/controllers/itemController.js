const itemData = require('../models/itemDB');
const { logger } = require('../helpers/winston');

/**
 * Devuelve la siguiente pregunta disponible
 */
function getSiguienteItem(req, res, next) {
    logger.info('itemController.getsiguienteItem');
    itemData.extraerSiguienteItem(req.idUsuario, req.idPerfil, req.params['idEntrevista']) // Extrae el siguiente item disponible
    .then(function(item) {
        if (item) {
            itemData.extraerIdItemsRespondidos(req.idUsuario, req.idPerfil, req.params['idEntrevista'])
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
    });
};

/**
 * Devuelve el item respondido y asociado a un ID determinado
 */
function getItemRespondido(req, res, next) {
    logger.info('itemController.getItemRespondido');
    itemData.extraerItemRespondido(req.idUsuario, req.idPerfil, req.params['idEntrevista'], req.params['idItem'])
    .then(function(item) {
        itemData.extraerIdItemsRespondidos(req.idUsuario, req.idPerfil, req.params['idEntrevista'])
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
    });
};

/**
 * Guarda la respuesta del usuario en la base de datos
 */
function setItem(req, res, next) {
    logger.info('itemController.setItem');
    itemData.almacenarItem(req.idUsuario, req.idPerfil, req.body)
    .then(function(item) {
        res.status(201).json(item);
    })
    .catch(function(error) {
        logger.error('itemController.setItem.500');
        var err = new Error(error.message ? error.message : error);
        err.statusCode = 500; // HTTP 500 Internal Server Error
        next(err);
    });
};

/**
 * Actualiza la respuesta del usuario en la base de datos
 */
function updateItem(req, res, next) {
    logger.info('itemController.updateItem');
    itemData.actualizarItem(req.idUsuario, req.idPerfil, req.body)
    .then(function(item) {
        res.status(201).json(item);
    })
    .catch(function(error) {
        logger.error('itemController.updateItem.500');
        var err = new Error(error.message ? error.message : error);
        err.statusCode = 500; // HTTP 500 Internal Server Error
        next(err);
    });
};

module.exports = { getSiguienteItem, getItemRespondido, setItem, updateItem }
