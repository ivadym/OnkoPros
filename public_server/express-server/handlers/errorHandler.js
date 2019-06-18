const { logger } = require('../helpers/logger');

/**
 * Tratamiento de los errores ocurridos en el lado del servidor
 */
function errorHandler(err, req, res, next) {
    logger.error(err.message);
    err.statusCode = err.statusCode ? err.statusCode : 500;
    res.status(err.statusCode).send(err.message);
};

module.exports = { errorHandler };
