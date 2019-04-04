const entrevistasData = require('../models/entrevistasDB');

/**
 * Devuelve las entrevistas disponibles actualmente
 */
exports.getEntrevistas = function (req, res, next) {
    extraerEntrevistas(req.idUsuario)
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
function extraerEntrevistas(idUsuario) {
    return entrevistasData.getEntrevistas(idUsuario);
}

/**
 * Devuelve la entrevista asociada a un ID determinado
 */
exports.getEntrevista = function (req, res, next) {
    var id = req.params['id'];
    extraerEntrevista(id)
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

function extraerEntrevista(id) {
    return entrevistasData.getEntrevista(id);
}