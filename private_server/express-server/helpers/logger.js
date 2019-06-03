const winston = require('winston');
const expressWinston = require('express-winston');

const log = require('../config/log')

/**
 * Formato de impresión personalizado
 */
const formatoPersonalizado = winston.format.printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});

/**
 * Filtra los logs a mostrar/escribir por nivel
 */
const filtrarLogs = winston.format((info, opts) => {
    if(log.activo) {
        if (log.filtroUnico) {
            if (opts === 'console') {
                if (log.levelConsole === info.level) {
                    return info;
                } else {
                    return false;
                }
            } else if (opts === 'file') {
                if (log.levelFile === info.level) {
                    return info;
                } else {
                    return false;
                }
            }
        } else {
            return info;
        }
    } else {
        return false;
    }
});

/**
 * Transports
 */
const transports = {
    console: new winston.transports.Console({
        level: log.levelConsole, // Máximo nivel de logs que se van a mostrar
        format: winston.format.combine(
            filtrarLogs('console'),
            winston.format.colorize(),
            winston.format.label({ label: 'SERV' }),
            winston.format.timestamp(),
            formatoPersonalizado
        )
    }),
    file: new winston.transports.File({
        filename: 'logs/app.log',
        level: log.levelFile, // Máximo nivel de logs que se van a escribir
        format: winston.format.combine(
            filtrarLogs('file'),
            winston.format.label({ label: 'SERV' }),
            winston.format.timestamp(),
            formatoPersonalizado
        )
    })
};

/**
 * Winston logger
 */
const logger = winston.createLogger({
    transports: [
        transports.console,
        transports.file
    ]
});

/**
 * Express logger (peticiones HTTP)
 */
const expressLogger = expressWinston.logger({
    level: 'info',
    transports: [
        transports.console,
        transports.file
    ]
});

/**
 * Express error logger (peticiones HTTP/accesos BBDD)
 */
const expressErrorLogger = expressWinston.errorLogger({
    level: 'error',
    transports: [
        transports.console,
        transports.file
    ]
});

module.exports = { logger, expressLogger, expressErrorLogger };
