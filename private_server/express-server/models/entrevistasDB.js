const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;

/**
 * Extrae las entrevistas asociadas a un usuario determinado
 */
function extraerEntrevistas(pool, idUsuario, idPerfil) {
    var query = `SELECT op_e.IdEntrevista, op_e.IdSujeto, op_e.TipoSujeto, e.Titulo, e.Tooltip, ei.InstruccionPrincipal, ei.InstruccionSecundaria, op_e.FechaLimite
                FROM OP_ENTREVISTA op_e INNER JOIN GEOP_ENTREVISTA e ON e.IdEntrevista=op_e.IdEntrevista
                INNER JOIN GEOP_ENTREVISTA_INSTRUCCIONES ei ON ei.IdEntrevista=op_e.IdEntrevista
                WHERE op_e.IdUsuario=@idUsuario AND op_e.IdPerfil=@idPerfil AND (op_e.Estado BETWEEN 0 AND 19) AND (@fechaActual BETWEEN op_e.FechaInicio AND op_e.FechaLimite) AND e.Estado=1
                ORDER BY op_e.FechaLimite ASC;`;
    var result = [];
    
    return new Promise(function(resolve, reject) {
        pool.acquire(function (err, connection) {
            if (err) {
                reject(err);
            } else {
                var request = new Request(query, function(err, rowCount, rows) {
                    if (err) {
                        reject(err);
                    } else {
                        connection.release();
                    }
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
function extraerEntrevista(pool, idUsuario, idPerfil, idEntrevista) {
    var query = `SELECT op_e.IdEntrevista, op_e.IdSujeto, op_e.TipoSujeto, e.Titulo, e.Tooltip, ei.InstruccionPrincipal, ei.InstruccionSecundaria, op_e.FechaLimite
                FROM OP_ENTREVISTA op_e INNER JOIN GEOP_ENTREVISTA e ON e.IdEntrevista=op_e.IdEntrevista
                INNER JOIN GEOP_ENTREVISTA_INSTRUCCIONES ei ON ei.IdEntrevista=op_e.IdEntrevista
                WHERE op_e.IdUsuario=@idUsuario AND op_e.IdPerfil=@idPerfil AND op_e.IdEntrevista=@idEntrevista AND (op_e.Estado BETWEEN 0 AND 19) AND (@fechaActual BETWEEN op_e.FechaInicio AND op_e.FechaLimite) AND e.Estado=1;`;
    var result = [];
    
    return new Promise(function(resolve, reject) {
        pool.acquire(function (err, connection) {
            if (err) {
                reject(err);
            } else {
                var request = new Request(query, function(err, rowCount, rows) {
                    if (err) {
                        reject(err);
                    } else {
                        connection.release();
                    }
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
function actualizarEstadoEntrevista(pool, idEntrevistaUsuario) {
    var query = `UPDATE OP_ENTREVISTA
                SET Estado=10
                WHERE IdEntrevistaUsuario=@idEntrevistaUsuario AND (Estado BETWEEN 0 AND 1);`;
    
    return new Promise(function(resolve, reject) {
        pool.acquire(function (err, connection) {
            if (err) {
                reject(err);
            } else {
                var request = new Request(query, function(err, rowCount, rows) {
                    if (err) {
                        reject(err);
                    } else {
                        connection.release();
                    }
                });
                
                request.addParameter('idEntrevistaUsuario', TYPES.Int, idEntrevistaUsuario);
                
                request.on('requestCompleted', function() {
                    resolve(true);
                });
                
                connection.execSql(request);
            }
        });
    });
}

module.exports = { extraerEntrevistas, extraerEntrevista, actualizarEstadoEntrevista }
