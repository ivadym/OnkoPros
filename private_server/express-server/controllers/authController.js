const authData = require('../models/authDB');

/**
 * Lleva a cabo la autenticación del usuario
 */
function autenticacion(req, res, next) {
    const usuario = req.body.usuario;
    const clave = req.body.clave;
    authData.comprobarCredenciales(usuario, clave)
    .then(function(usuario) {
        if (usuario) {
            req.usuario = usuario;
            next();
        } else {
            var err = new Error("Forbidden");
            err.statusCode = 403; // HTTP 403 Forbidden
            next(err);
        }
    })
    .catch(function(error) {
        var err = new Error(error.message ? error.message : error);
        err.statusCode = 500; // HTTP 500 Internal Server Error
        next(err);
    });
};

module.exports = { autenticacion }
