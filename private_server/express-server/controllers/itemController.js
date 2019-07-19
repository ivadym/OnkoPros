const itemData = require('../models/itemDB');

const { conexionPool } = require('../helpers/conexionPool');
const { extraerIdEntrevistaUsuario } = require('../helpers/helperDB');
const { logger } = require('../helpers/logger');

/**
 * Devuelve la siguiente pregunta disponible
 */
function getSiguienteItem(req, res, next) {
    logger.info(req.idUsuario + ' > itemController.getsiguienteItem');
    
    var pool = conexionPool();
    
    extraerIdEntrevistaUsuario(pool, req.idUsuario, req.idPerfil, req.params['idEntrevista'])
    .then(idEntrevistaUsuario => {
        return itemData.extraerContextoItemSiguiente(pool, idEntrevistaUsuario, {'op': true})
        .then(ctx => {
            if (ctx) {
                if (ctx.IdSiguienteItem) {
                    return itemData.extraerItem(pool, req.params['idEntrevista'], ctx.IdSiguienteAgrupacion, ctx.IdSiguienteItem)
                    .then(item => {
                        return itemData.extraerIdItemsRespondidos(pool, idEntrevistaUsuario)
                        .then(idItemsRespondidos => {
                            res.status(200).json({
                                item: item,
                                idItemsRespondidos: idItemsRespondidos
                            });
                        });
                    });
                } else {
                    return itemData.extraerContextoItemSiguiente(pool, idEntrevistaUsuario, {'item': true})
                    .then(ctx => {
                        if (ctx) {
                            return itemData.extraerItem(pool, req.params['idEntrevista'], ctx.IdSiguienteAgrupacion, ctx.IdSiguienteItem)
                            .then(item => {
                                return itemData.extraerIdItemsRespondidos(pool, idEntrevistaUsuario)
                                .then(idItemsRespondidos => {
                                    res.status(200).json({
                                        item: item,
                                        idItemsRespondidos: idItemsRespondidos
                                    });
                                });
                            });
                        } else {
                            res.status(200).json(null); // Entrevista finalizada
                        }
                    });
                }
            } else {
                logger.error(req.idUsuario + ' > itemController.getsiguienteItem.404');
                var err = new Error('Error al extraer un item de una entrevista no encontrada');
                err.statusCode = 404; // HTTP 404 Not Found
                next(err);
            }
        })
        .catch(error => {
            logger.error(req.idUsuario + ' > itemController.getsiguienteItem.500');
            var err = new Error(error.message ? error.message : error);
            err.statusCode = 500; // HTTP 500 Internal Server Error
            next(err);
        });
    });
};

/**
 * Guarda la respuesta del usuario en la base de datos
 */
function setItem(req, res, next) {
    logger.info(req.idUsuario + ' > itemController.setItem');
    
    var pool = conexionPool();
    itemData.almacenarItem(pool, req.idUsuario, req.idPerfil, req.body)
    .then(item => {
        res.status(201).json(item);
    })
    .catch(error => {
        logger.error(req.idUsuario + ' > itemController.setItem.500');
        var err = new Error(error.message ? error.message : error);
        err.statusCode = 500; // HTTP 500 Internal Server Error
        next(err);
    });
};

/**
 * Devuelve el item respondido y asociado a un ID determinado
 */
function getItemRespondido(req, res, next) {
    logger.info(req.idUsuario + ' > itemController.getItemRespondido');
    
    var pool = conexionPool();
    extraerIdEntrevistaUsuario(pool, req.idUsuario, req.idPerfil, req.params['idEntrevista'])
    .then(idEntrevistaUsuario => {
        return itemData.extraerItemRespondido(pool, idEntrevistaUsuario, req.params['idItem'])
        .then(item => {
            return itemData.extraerIdItemsRespondidos(pool, idEntrevistaUsuario)
            .then(idItemsRespondidos => {
                res.status(200).json({
                    item: item,
                    idItemsRespondidos: idItemsRespondidos
                });
            })
        });
    })
    .catch(error => {
        logger.error(req.idUsuario + ' > itemController.getItemRespondido.500');
        var err = new Error(error.message ? error.message : error);
        err.statusCode = 500; // HTTP 500 Internal Server Error
        next(err);
    })
};

/**
 * Actualiza la respuesta del usuario en la base de datos (se sobrescribe la anterior respuesta)
 */
function updateItem(req, res, next) {
    logger.info(req.idUsuario + ' > itemController.updateItem');
    
    var pool =  conexionPool();
    itemData.actualizarItem(pool, req.idUsuario, req.idPerfil, req.body)
    .then(item => {
        res.status(201).json(item);
    })
    .catch(error => {
        logger.error(req.idUsuario + ' > itemController.updateItem.500');
        var err = new Error(error.message ? error.message : error);
        err.statusCode = 500; // HTTP 500 Internal Server Error
        next(err);
    })
};

module.exports = { getSiguienteItem, getItemRespondido, setItem, updateItem }
