/**
 * Tratamiento de los errores ocurridos en el lado del servidor
 */
function errorHandler(err, req, res, next) {
    err.statusCode = err.statusCode ? err.statusCode : 500;
    res.status(err.statusCode).send(err.message);
};

module.exports = { errorHandler };
