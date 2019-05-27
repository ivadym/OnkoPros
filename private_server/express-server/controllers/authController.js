const authData = require('../models/authDB');

/**
 * Lleva a cabo la autenticación del usuario
 */
exports.autenticacion = function(req, res, next) {
    const usuario = req.body.usuario;
    const clave = req.body.clave;
    authData.comprobarCredenciales(usuario, clave)
    .then(function(usuario) {
        if (usuario) {
            req.usuario = usuario;
            next();
        } else {
            // TODO: Mejor manejo de errores
            res.sendStatus(403); // HTTP 403 Forbidden
        }
    })
    .catch(function(error) {
        // TODO: Mejor manejo de errores
        res.sendStatus(500); // HTTP 500 Internal Server Error
    });
};
