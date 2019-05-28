const winston = require('winston');
const expressWinston = require('express-winston');

const log = require('../config/log')

/**
 * Filtra los logs a mostrar/escribir por nivel
 */
const filtarLevel = winston.format((info, opts) => {
    if (log.filtroUnico) {
        if (log.level === info.level) {
            return info;
        } else {
            return false;
        }
    } else {
        return info;
    }
});

/**
 * Express logger (peticiones HTTP)
 */
const expressLogger = expressWinston.logger({
    level: 'info',
    transports: [
        new winston.transports.Console({
            level: log.level // Imprime el nivel especificado y todos los inferiores
        })
    ],
    format: winston.format.combine(
        filtarLevel(),
        winston.format.json(),
        winston.format.colorize()
    )
});

/**
 * Express error logger (peticiones HTTP/accesos BBDD)
 */
const expressErrorLogger = expressWinston.errorLogger({
    level: 'error',
    transports: [
        new winston.transports.Console()
    ],
    format: winston.format.combine(
        filtarLevel(),
        winston.format.json(),
        winston.format.colorize()
    )
});

module.exports = { expressLogger, expressErrorLogger };
