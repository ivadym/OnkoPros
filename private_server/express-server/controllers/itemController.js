const itemData = require('../models/itemDB');

/**
 * Devuelve la siguiente pregunta disponible
 */
function getSiguienteItem(req, res, next) {
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
        var err = new Error(error.message ? error.message : error);
        err.statusCode = 500; // HTTP 500 Internal Server Error
        next(err);
    });
};

/**
 * Devuelve el item respondido y asociado a un ID determinado
 */
function getItemRespondido(req, res, next) {
    itemData.extraerItemRespondido(req.idUsuario, req.idPerfil, req.params['idEntrevista'], req.params['idItem'])
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
        var err = new Error(error.message ? error.message : error);
        err.statusCode = 500; // HTTP 500 Internal Server Error
        next(err);
    });
};

/**
 * Guarda la respuesta del usuario en la base de datos
 */
function setItem(req, res, next) {
    itemData.almacenarItem(req.idUsuario, req.idPerfil, req.body)
    .then(function(item) {
        res.status(201).json(item);
    })
    .catch(function(error) {
        var err = new Error(error.message ? error.message : error);
        err.statusCode = 500; // HTTP 500 Internal Server Error
        next(err);
    });
};

/**
 * Actualiza la respuesta del usuario en la base de datos
 */
function updateItem(req, res, next) {
    itemData.actualizarItem(req.idUsuario, req.idPerfil, req.body)
    .then(function(item) {
        if (item) {
            res.status(201).json(item);
        } else {
            var err = new Error(error.message ? error.message : error);
            err.statusCode = 500; // HTTP 500 Internal Server Error
            next(err);
        }
    })
    .catch(function(error) {
        var err = new Error(error.message ? error.message : error);
        err.statusCode = 500; // HTTP 500 Internal Server Error
        next(err);
    });
};

module.exports = { getSiguienteItem, getItemRespondido, setItem, updateItem }
