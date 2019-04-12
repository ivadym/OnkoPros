const itemData = require('../models/itemDB');

/**
 * Devuelve la siguiente pregunta disponible
 */
exports.getItem = function (req, res, next) {
    var idEntrevista = req.params['id'];
    extraerItem(req.idUsuario, idEntrevista)
    .then(function(item) {
        if(item) {
            res.status(200).json(item);
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
 * Extrae el siguiente item disponible
 */
function extraerItem(idUsuario, idEntrevista) {
    return itemData.extraerItem(idUsuario, idEntrevista, null);
}
