const authData = require('../models/authDB');

const { conexionPool } = require('../helpers/conexionPool');
const { logger } = require('../helpers/logger');

/**
 * Lleva a cabo la autenticación del usuario
 */
function autenticacion(req, res, next) {
    logger.info('Usuario: ' + req.body.usuario + ' > authController.autenticacion');
    
    const usuario = req.body.usuario;
    const clave = req.body.clave;
    
    var pool = conexionPool();
    authData.comprobarCredenciales(pool, usuario, clave)
    .then(usuario => {
        if (usuario) {
            req.usuario = usuario;
            next();
        } else {
            logger.error('Usuario: ' + req.body.usuario + ' > authController.autenticacion.403');
            var err = new Error('Forbidden');
            err.statusCode = 403; // HTTP 403 Forbidden
            next(err);
        }
    })
    .catch(error => {
        logger.error('Usuario: ' + req.body.usuario + ' > authController.autenticacion.500');
        var err = new Error(error.message ? error.message : error);
        err.statusCode = 500; // HTTP 500 Internal Server Error
        next(err);
    });
};

module.exports = { autenticacion }
