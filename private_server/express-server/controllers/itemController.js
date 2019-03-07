const db = require('../models/mock_dababase');

/**
 * Devuelve la siguiente pregunta disponible
 */
exports.getItem = function (req, res, next) {
    var id = req.params['id'];
    extraerItem(id)
    .then(function(item) {
        if(item[0]) {
            res.status(200).json(item[0]);
        } else if(item[0] === undefined) {
            res.status(200).json(null);
        } else {
            res.sendStatus(400); // HTTP 400 Bad Request
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
    // TODO: Acceso BBDD / Envío de la petición al siguiente servidor
    return db.getItem(id);
}
