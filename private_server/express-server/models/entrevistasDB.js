const Connection = require('tedious').Connection;
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;

const config = require('../config/authSQL');

/**
 * Extrae las entrevistas asociadas a un usuario determinado
 */
function extraerEntrevistas(idUsuario, idPerfil) {
    return new Promise(function(resolve, reject) {
        var connection = new Connection(config.auth);
        var query = `SELECT e.IdEntrevista, e.IdSujeto, e.TipoSujeto, eg.Titulo, eg.Tooltip, ei.InstruccionPrincipal, ei.InstruccionSecundaria, e.FechaLimite
                    FROM OP_ENTREVISTA e INNER JOIN GEOP_ENTREVISTA eg ON e.IdEntrevista=eg.IdEntrevista
                    INNER JOIN GEOP_ENTREVISTA_INSTRUCCIONES ei ON e.IdEntrevista=ei.IdEntrevista
                    WHERE e.IdUsuario=@idUsuario AND e.IdPerfil=@idPerfil AND (e.Estado BETWEEN 0 AND 19) AND eg.Estado=1 AND (@fechaActual BETWEEN e.FechaInicio AND e.FechaLimite)
                    ORDER BY e.FechaLimite ASC;`;
        var result = [];

        connection.on('connect', function(err) {
            if (err) {
                reject(err);
            } else {
                request = new Request(query, function(err, rowCount, rows) {
                    if (err) {
                        reject(err);
                    }
                    connection.close();
                });

                request.addParameter('idUsuario', TYPES.Int, idUsuario);
                request.addParameter('idPerfil', TYPES.Int, idPerfil);
                request.addParameter('fechaActual', TYPES.Date, new Date());

                request.on('row', function(columns) {
                    var rowObject = {};
                    columns.forEach(function(column) {
                        rowObject[column.metadata.colName] = column.value;
                    });
                    result.push(rowObject);
                });
                
                request.on('requestCompleted', function() {
                    resolve(result);
                });

                connection.execSql(request);
            }
        });
    });
}

/**
 * Estrae la entrevista asociada a un usuario e identificador determinados
 */
function extraerEntrevista(idUsuario, idPerfil, idEntrevista) {
    return new Promise(function(resolve, reject) {
        var connection = new Connection(config.auth);
        var query = `SELECT e.IdEntrevista, e.IdSujeto, e.TipoSujeto, eg.Titulo, eg.Tooltip, ei.InstruccionPrincipal, ei.InstruccionSecundaria, e.FechaLimite
                    FROM OP_ENTREVISTA e INNER JOIN GEOP_ENTREVISTA eg ON e.IdEntrevista=eg.IdEntrevista
                    INNER JOIN GEOP_ENTREVISTA_INSTRUCCIONES ei ON e.IdEntrevista=ei.IdEntrevista
                    WHERE e.IdUsuario=@idUsuario AND e.IdPerfil=@idPerfil AND e.IdEntrevista=@idEntrevista AND (e.Estado BETWEEN 0 AND 19) AND eg.Estado=1 AND (@fechaActual BETWEEN e.FechaInicio AND e.FechaLimite);`;
        var result = [];

        connection.on('connect', function(err) {
            if (err) {
                reject(err);
            } else {
                request = new Request(query, function(err, rowCount, rows) {
                    if (err) {
                        reject(err);
                    }
                    connection.close();
                });

                request.addParameter('idUsuario', TYPES.Int, idUsuario);
                request.addParameter('idPerfil', TYPES.Int, idPerfil);
                request.addParameter('idEntrevista', TYPES.Int, idEntrevista);
                request.addParameter('fechaActual', TYPES.Date, new Date());

                request.on('row', function(columns) {
                    var rowObject = {};
                    columns.forEach(function(column) {
                        rowObject[column.metadata.colName] = column.value;
                    });
                    result.push(rowObject);
                });
                
                request.on('requestCompleted', function() {
                    resolve(result[0]);
                });

                connection.execSql(request);
            }
        });
    });
}

/**
 * Actualiza el estado de la entrevista (en progreso)
 */
function actualizarEstadoEntrevista(idUsuario, idPerfil, item) {
    return new Promise(function(resolve, reject) {
        var connection = new Connection(config.auth);
        var query = `UPDATE OP_ENTREVISTA
                    SET Estado=10
                    WHERE IdUsuario=@idUsuario AND IdPerfil=@idPerfil AND IdEntrevista=@idEntrevista AND (Estado BETWEEN 0 AND 1);`;

        connection.on('connect', function(err) {
            if (err) {
                reject(err);
            } else {
                request = new Request(query, function(err, rowCount, rows) {
                    if (err) {
                        reject(err);
                    }
                    connection.close();
                });

                request.addParameter('idUsuario', TYPES.Int, idUsuario);
                request.addParameter('idPerfil', TYPES.Int, idPerfil);
                request.addParameter('idEntrevista', TYPES.Int, item.IdEntrevista);
                
                request.on('requestCompleted', function() {
                    resolve(item);
                });

                connection.execSql(request);
            }
        });
    });
}

/**
 * Finaliza una entrevista deetrminada (no quedan más items por responder)
 */
function finalizarEntrevista(idUsuario, idPerfil, idEntrevista) {
    return new Promise(function(resolve, reject) {
        var connection = new Connection(config.auth);
        var query = `UPDATE OP_ENTREVISTA
                    SET Estado=20
                    WHERE IdUsuario=@idUsuario AND IdPerfil=@idPerfil AND IdEntrevista=@idEntrevista AND (Estado BETWEEN 10 AND 19);`;

        connection.on('connect', function(err) {
            if (err) {
                reject(err);
            } else {
                request = new Request(query, function(err, rowCount, rows) {
                    if (err) {
                        reject(err);
                    }
                    connection.close();
                });

                request.addParameter('idUsuario', TYPES.Int, idUsuario);
                request.addParameter('idPerfil', TYPES.Int, idPerfil);
                request.addParameter('idEntrevista', TYPES.Int, idEntrevista);
                
                request.on('requestCompleted', function() {
                    resolve(null);
                });

                connection.execSql(request);
            }
        });
    });
}

module.exports = { extraerEntrevistas, extraerEntrevista, actualizarEstadoEntrevista, finalizarEntrevista }
