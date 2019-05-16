const valorData = require('../models/valorDB');

/**
 * Guarda la respuesta del usuario en la base de datos
 */
exports.setItemValor = function (req, res, next) {
    valorData.almacenarItemValor(req.idUsuario, req.idPerfil, req.body)
    .then(function(item) {
        if(item) {
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
  