const itemData = require('../data/itemData');

/**
 * Devuelve la siguiente pregunta disponible
 */
exports.getItem = function (req, res, next) {
    var id_entrevista = req.params['id'];
    extraerItem(id_entrevista)
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
 * Extrae las entrevistas disponibles
 */
function extraerItem(id) {
    return itemData.getItem(id);
}
