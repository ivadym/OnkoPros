const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;

/**
 * Extrae el ID asociado a una entrevista asignada a un usuario y perfil determinados
 */
function extraerIdEntrevistaUsuario(pool, idUsuario, idPerfil, idEntrevista) {
    var query = `SELECT op_e.IdEntrevistaUsuario FROM OP_ENTREVISTA op_e
                WHERE op_e.IdUsuario=@idUsuario AND op_e.IdPerfil=@idPerfil AND op_e.IdEntrevista=@idEntrevista AND (op_e.Estado BETWEEN 0 AND 19) AND (@fechaActual BETWEEN op_e.FechaInicio AND op_e.FechaLimite);`;
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
                        rowObject = column.value;
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
 * Extrae el ID asociado a una entrevista asignada a un usuario y aun perfil determinados, así como a un item ya contestado
 */
function extraerIdEntrevistaItem(pool, idEntrevistaUsuario, idItem) {
    var query = `SELECT op_ei.IdEntrevistaItem FROM OP_ENTREVISTA_ITEM op_ei 
                WHERE op_ei.IdEntrevistaUsuario=@idEntrevistaUsuario AND op_ei.IdItem=@idItem AND op_ei.Estado=1;`;
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
                
                request.addParameter('idEntrevistaUsuario', TYPES.Int, idEntrevistaUsuario);
                request.addParameter('idItem', TYPES.Int, idItem);
                
                request.on('row', function(columns) {
                    var rowObject = {};
                    columns.forEach(function(column) {
                        rowObject = column.value;
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
 * Extrae el siguiente orden de respuesta correspondiente a la tupla enterevista/usuario
 */
function extraerOrden(pool, idEntrevistaUsuario) {
    var query = `SELECT ISNULL(MAX(CAST(Orden AS numeric)), 0)+1 FROM OP_ENTREVISTA_ITEM op_ei
                WHERE op_ei.IdEntrevistaUsuario=@idEntrevistaUsuario AND op_ei.Estado>0;`;
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
                
                request.addParameter('idEntrevistaUsuario', TYPES.Int, idEntrevistaUsuario);
                
                request.on('row', function(columns) {
                    var rowObject = {};
                    columns.forEach(function(column) {
                        rowObject = column.value;
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

module.exports = { extraerIdEntrevistaUsuario, extraerIdEntrevistaItem, extraerOrden };
