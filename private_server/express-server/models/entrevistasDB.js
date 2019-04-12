const Connection = require('tedious').Connection;
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;

const config = require('./config');


/**
 * Extrae las entrevistas asociadas a un usuario determinado
 */
exports.extraerEntrevistas = function (idUsuario) {
    return new Promise(function(resolve, reject) {
        var connection = new Connection(config.auth);
        var query = `SELECT e.IdEntrevista, eg.Titulo, eg.Tooltip, ei.InstruccionPrincipal, ei.InstruccionSecundaria, e.FechaLimite
                    FROM OP_ENTREVISTA e INNER JOIN GEOP_ENTREVISTA eg ON e.IdEntrevista=eg.IdEntrevista
                    INNER JOIN GEOP_ENTREVISTA_INSTRUCCIONES ei ON e.IdEntrevista=ei.IdEntrevista
                    WHERE IdUsuario=@idUsuario AND (e.Estado BETWEEN 0 AND 19) AND eg.Estado=1 AND (@fechaActual BETWEEN e.FechaInicio AND e.FechaLimite)
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
                request.addParameter('fechaActual', TYPES.Date, new Date());

                request.on('row', function(columns) {
                    var rowObject = {};
                    columns.forEach(function(column) {
                        rowObject[column.metadata.colName] = column.value;
                    });
                    result.push(rowObject);
                });
                
                request.on('requestCompleted', function () {
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
exports.extraerEntrevista = function (idUsuario, idEntrevista) {
    return new Promise(function(resolve, reject) {
        var connection = new Connection(config.auth);
        var query = `SELECT e.IdEntrevista, eg.Titulo, eg.Tooltip, ei.InstruccionPrincipal, ei.InstruccionSecundaria, e.FechaLimite
                    FROM OP_ENTREVISTA e INNER JOIN GEOP_ENTREVISTA eg ON e.IdEntrevista=eg.IdEntrevista
                    INNER JOIN GEOP_ENTREVISTA_INSTRUCCIONES ei ON e.IdEntrevista=ei.IdEntrevista
                    WHERE e.IdUsuario=@idUsuario AND e.IdEntrevista=@idEntrevista AND (e.Estado BETWEEN 0 AND 19) AND eg.Estado=1 AND (@fechaActual BETWEEN e.FechaInicio AND e.FechaLimite);`;
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
                request.addParameter('idEntrevista', TYPES.Int, idEntrevista);
                request.addParameter('fechaActual', TYPES.Date, new Date());

                request.on('row', function(columns) {
                    var rowObject = {};
                    columns.forEach(function(column) {
                        rowObject[column.metadata.colName] = column.value;
                    });
                    result.push(rowObject);
                });
                
                request.on('requestCompleted', function () {
                    resolve(result[0]);
                });

                connection.execSql(request);
            }
        });
    });
}
