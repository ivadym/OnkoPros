const Connection = require('tedious').Connection;
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;

const config = require('./config');


/**
 * Devuelve las entrevistas disponibles
 */
exports.getEntrevistas = function (idUsuario) {
    return new Promise(function(resolve, reject) {
        var connection = new Connection(config.auth);
        var fechaActual = new Date();
        var query = `SELECT e.IdEntrevista, eg.Titulo, eg.Tooltip, ei.InstruccionPrincipal, ei.InstruccionSecundaria, e.FechaLimite
                    FROM OP_ENTREVISTA e INNER JOIN GEOP_ENTREVISTA eg
                    ON IdUsuario=@idUsuario AND e.IdEntrevista=eg.IdEntrevista AND eg.Estado=1 AND (e.Estado BETWEEN 0 AND 19) AND (@fechaActual BETWEEN e.FechaInicio AND e.FechaLimite)
                    INNER JOIN GEOP_ENTREVISTA_INSTRUCCIONES ei
                    ON e.IdEntrevista=ei.IdEntrevista ORDER BY e.FechaLimite ASC;`
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
                request.addParameter('fechaActual', TYPES.Date, fechaActual);

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
 * Devuelve la entrevista asociada al ID: id
 */
exports.getEntrevista = function (id) {
    return new Promise(function(resolve, reject) {
        var connection = new Connection(config.auth);
        var fecha_actual = new Date();
        var query = `SELECT * FROM GEOP_ENTREVISTA WHERE id=@id AND activo='true' AND fecha_limite>=@fecha_actual;`;
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

                request.addParameter('id', TYPES.Int, id);
                request.addParameter('fecha_actual', TYPES.Date, fecha_actual);

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
