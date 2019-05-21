const itemData = require('../models/itemDB');

/**
 * Devuelve la siguiente pregunta disponible
 */
exports.getSiguienteItem = function(req, res, next) {
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
        // TODO: Mejor manejo de errores
        res.sendStatus(500); // HTTP 500 Internal Server Error
    });
};

/**
 * Devuelve el item respondido y asociado a un ID determinado
 */
exports.getItemRespondido = function(req, res, next) {
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
        // TODO: Mejor manejo de errores
        res.sendStatus(500); // HTTP 500 Internal Server Error
    });
};

/**
 * Guarda la respuesta del usuario en la base de datos
 */
exports.setItem = function(req, res, next) {
    itemData.almacenarItem(req.idUsuario, req.idPerfil, req.body)
    .then(function(item) {
        if (item) {
            res.status(201).json(item);
        } else {
            // TODO: Mejor manejo de errores
            res.sendStatus(500); // HTTP 500 Internal Server Error
        }
    })
    .catch(function(error) {
        // TODO: Mejor manejo de errores
        res.sendStatus(500); // HTTP 500 Internal Server Error
    });
};

/**
 * Actualiza la respuesta del usuario en la base de datos
 */
exports.updateItem = function(req, res, next) {
    itemData.actualizarItem(req.idUsuario, req.idPerfil, req.body)
    .then(function(item) {
        if (item) {
            res.status(201).json(item);
        } else {
            // TODO: Mejor manejo de errores
            res.sendStatus(500); // HTTP 500 Internal Server Error
        }
    })
    .catch(function(error) {
        // TODO: Mejor manejo de errores
        res.sendStatus(500); // HTTP 500 Internal Server Error
    });
};
