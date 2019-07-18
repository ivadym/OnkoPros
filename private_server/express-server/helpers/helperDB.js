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
    var query = `SELECT ISNULL(MAX(CAST(op_ei.Orden AS numeric)), 0)+1 FROM OP_ENTREVISTA_ITEM op_ei
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

/**
 * Extrae las reglas a ejecutar asociadas a una agrupación y ejecuta los procedimientos almacenados correspondientes
 */
function comprobarReglaAgrupacion(pool, idEntrevistaUsuario, idAgrupacion) {
    var query = `SELECT r.IdRegla, r.ProcedimientoSQL, r.IdAgrupacionSalto, r.UmbralSalto
                FROM GEOP_ITEM_REGLA ir
                INNER JOIN GEOP_REGLA r ON r.IdRegla=ir.IdRegla
                WHERE ir.IdItem=@idAgrupacion AND ir.Estado=1 AND r.Estado=1
                ORDER BY CAST(ir.Orden AS numeric) ASC;`;
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
                
                request.addParameter('idAgrupacion', TYPES.Int, idAgrupacion);
                
                request.on('row', function(columns) {
                    var rowObject = {};
                    columns.forEach(function(column) {
                        rowObject[column.metadata.colName] = column.value;
                    });
                    result.push(rowObject);
                });
                
                request.on('requestCompleted', function() {
                    if (result[0]) {
                        return ejecutarProcedimientoAgrupacion(pool, idEntrevistaUsuario, idAgrupacion, result, 0)
                        .then(res => {
                            resolve(res);
                        })
                        .catch(error => reject(error)); // Catch de promises anidadas
                    } else {
                        resolve(null);
                    }
                });
                
                connection.execSql(request);
            }
        });
    });
}

/**
 * Ejecuta un procedimiento almacenado asociado a una regla determinada
 */
function ejecutarProcedimientoAgrupacion(pool, idEntrevistaUsuario, idAgrupacion, regla, index) {
    var procedimiento = regla[index].ProcedimientoSQL;
    var result = null;
    
    return new Promise(function(resolve, reject) {
        pool.acquire(function (err, connection) {
            if (err) {
                reject(err);
            } else {
                var request = new Request(procedimiento, function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        connection.release();
                    }
                });
                
                request.addParameter('idEntrevistaUsuario', TYPES.Int, idEntrevistaUsuario);
                request.addParameter('idRegla', TYPES.Int, regla[index].IdRegla);
                request.addParameter('idAgrupacion', TYPES.Int, idAgrupacion);
                request.addOutputParameter('resultado', TYPES.Numeric, -2, {"precision": 18, "scale": 2});
                
                request.on('returnValue', function(parameterName, value, metadata) {
                    result = value;
                });
                
                request.on('requestCompleted', function() {
                    if (regla[index].UmbralSalto && result >= regla[index].UmbralSalto) {
                        // TODO: Añadir una nueva agrupación a la entrevista en curso con ID: regla[index].IdAgrupacionSalto
                    }

                    if (regla[++index]) { // Quedan más reglas asociadas a una agrupación
                        return ejecutarProcedimientoAgrupacion(pool, idEntrevistaUsuario, idAgrupacion, regla, index)
                        .then(res => {
                            resolve(res);
                        })
                        .catch(error => reject(error)); // Catch de promises anidadas
                    } else {
                        resolve(null);
                    }
                });
                
                connection.callProcedure(request);
            }
        });
    });
}

module.exports = { extraerIdEntrevistaUsuario, extraerIdEntrevistaItem, extraerOrden };
