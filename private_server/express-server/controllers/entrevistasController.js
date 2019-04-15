const entrevistasData = require('../models/entrevistasDB');

/**
 * Devuelve las entrevistas disponibles actualmente
 */
exports.getEntrevistas = function (req, res, next) {
    extraerEntrevistas(req.idUsuario, req.idPerfil)
    .then(function(entrevistas) {
        if(entrevistas[0]) { // Hay al menos 1 entrevista
            res.status(200).json(entrevistas);
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
 * Extrae las entrevistas disponibles
 */
function extraerEntrevistas(idUsuario, idPerfil) {
    return entrevistasData.extraerEntrevistas(idUsuario, idPerfil);
}

/**
 * Devuelve la entrevista asociada a un usuario e identificador determinados
 */
exports.getEntrevista = function (req, res, next) {
    extraerEntrevista(req.idUsuario, req.idPerfil, req.params['id'])
    .then(function(entrevista) {
        if(entrevista) {
            res.status(200).json(entrevista);
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
 * Extrae una única entrevista
 */
function extraerEntrevista(idUsuario, idPerfil, idEntrevista) {
    return entrevistasData.extraerEntrevista(idUsuario, idPerfil, idEntrevista);
}
