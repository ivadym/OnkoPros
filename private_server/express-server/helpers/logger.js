const winston = require('winston');
const expressWinston = require('express-winston');

const config = require('../config');

/**
 * Formato de impresión personalizado
 */
const formatoPersonalizado = winston.format.printf(({ timestamp, label, level, message }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});

const timestampFormat = 'DD/MM/YYYY HH:mm:ss:SSS'

/**
 * Filtra los logs a mostrar/escribir por nivel
 */
const filtrarLogs = winston.format((info, opts) => {
    if (config.logger.activo) {
        if (config.logger.filtroUnico) {
            if (opts === 'console') {
                if (config.logger.levelConsole === info.level) {
                    return info;
                } else {
                    return false;
                }
            } else if (opts === 'file') {
                if (config.logger.levelFile === info.level) {
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
        level: config.logger.levelConsole, // Máximo nivel de logs que se van a mostrar
        format: winston.format.combine(
            filtrarLogs('console'),
            winston.format.colorize(),
            winston.format.label({ label: 'SERV' }),
            winston.format.timestamp({
                format: timestampFormat
            }),
            formatoPersonalizado
        )
    }),
    file: new winston.transports.File({
        filename: config.logger.filename,
        level: config.logger.levelFile, // Máximo nivel de logs que se van a escribir
        format: winston.format.combine(
            filtrarLogs('file'),
            winston.format.label({ label: 'SERV' }),
            winston.format.timestamp({
                format: timestampFormat
            }),
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
 * Express logger (peticiones HTTPS)
 */
const expressLogger = expressWinston.logger({
    level: 'info',
    transports: [
        transports.console,
        transports.file
    ],
    msg: '{{req.idUsuario!=undefined ? req.idUsuario : req.body.usuario}} > HTTP {{req.method}} {{req.url}}'
});

/**
 * Express error logger (peticiones HTTPS/accesos BBDD)
 */
const expressErrorLogger = expressWinston.errorLogger({
    level: 'error',
    transports: [
        transports.console,
        transports.file
    ]
});

module.exports = { logger, expressLogger, expressErrorLogger };
