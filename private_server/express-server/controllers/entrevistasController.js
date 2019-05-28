const entrevistasData = require('../models/entrevistasDB');

/**
 * Devuelve las entrevistas disponibles actualmente
 */
function getEntrevistas(req, res, next) {
    entrevistasData.extraerEntrevistas(req.idUsuario, req.idPerfil)
    .then(function(entrevistas) {
        if (entrevistas[0]) { // Hay al menos 1 entrevista
            res.status(200).json(entrevistas);
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
 * Devuelve la entrevista asociada a un usuario y perfil determinados
 */
function getEntrevista(req, res, next) {
    entrevistasData.extraerEntrevista(req.idUsuario, req.idPerfil, req.params['idEntrevista'])
    .then(function(entrevista) {
        if (entrevista) {
            res.status(200).json(entrevista);
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

module.exports = { getEntrevistas, getEntrevista }
