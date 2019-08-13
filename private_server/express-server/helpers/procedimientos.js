const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;

/**
 * Extrae las reglas a ejecutar asociadas a una agrupación y ejecuta los procedimientos almacenados correspondientes
 */
function comprobarRegla(pool, idEntrevistaUsuario, idItem, item) {
    var query = `SELECT r.IdRegla, r.ProcedimientoSQL
                FROM GEOP_ITEM_REGLA ir
                INNER JOIN GEOP_REGLA r ON r.IdRegla=ir.IdRegla
                WHERE ir.IdItem=@idItem AND ir.Estado=1 AND r.Estado=1
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
                
                request.addParameter('idItem', TYPES.Int, idItem);
                
                request.on('row', function(columns) {
                    var rowObject = {};
                    columns.forEach(function(column) {
                        rowObject[column.metadata.colName] = column.value;
                    });
                    result.push(rowObject);
                });
                
                request.on('requestCompleted', function() {
                    if (result[0]) {
                        return procedimientoRegla(pool, idEntrevistaUsuario, idItem, item, result, 0)
                        .then(obj => {
                            resolve(obj);
                        })
                        .catch(error => reject(error)); // Catch de promises anidadas
                    } else {
                        resolve({
                            ctx: null,
                            item: item
                        });
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
function procedimientoRegla(pool, idEntrevistaUsuario, idItem, item, reglas, index) {
    var procedimiento = reglas[index].ProcedimientoSQL;
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
                request.addParameter('idRegla', TYPES.Int, reglas[index].IdRegla);
                request.addParameter('idItem', TYPES.Int, idItem);
                request.addOutputParameter('json', TYPES.NVarChar, null, {length: Infinity});
                
                request.on('returnValue', function(parameterName, value, metadata) {
                    result = JSON.stringify(value); // Permite representar caracteres especiales
                    json = JSON.parse(JSON.parse(result)); // Deshace el stringify de una string
                });
                
                request.on('requestCompleted', function() {
                    item.Alerta = json.Alerta;
                    if (reglas[++index]) { // Quedan más reglas asociadas a una agrupación
                        return procedimientoRegla(pool, idEntrevistaUsuario, idItem, item, reglas, index)
                        .then(obj => {
                            if (obj) {
                                resolve(obj);
                            } else {
                                resolve({
                                    ctx: json,
                                    item: item
                                });
                            }
                        })
                        .catch(error => reject(error)); // Catch de promises anidadas
                    } else {
                        return actualizarItemAlerta(pool, idEntrevistaUsuario, idItem, item.Alerta)
                        .then(res => {
                            resolve({
                                ctx: json,
                                item: item
                            });
                        })
                        .catch(error => reject(error)); // Catch de promises anidadas
                    }
                });
                
                connection.callProcedure(request);
            }
        });
    });
}

/**
 * Ejecuta un procedimiento almacenado que se encarga del borrado de los items & valores
 */
function procedimientoBorrado(pool, idEntrevistaUsuario, idItem) {
    var procedimiento = 'BORRADO_SIGUIENTES_ITEMS';
    
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
                request.addParameter('idItem', TYPES.Int, idItem);
                
                request.on('requestCompleted', function() {
                    resolve(true);
                });
                
                connection.callProcedure(request);
            }
        });
    });
}

/**
 * Actualiza la alerta asociada a una regla y a un item/agrupación
 */
function actualizarItemAlerta(pool, idEntrevistaUsuario, idItem, alerta) {
    var query = `UPDATE OP_ENTREVISTA_ITEM
                SET FechaRegistro=GETDATE(), Alerta=@alerta
                WHERE IdEntrevistaUsuario=@idEntrevistaUsuario AND IdItem=@idItem AND Estado>0;`;
    
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
                request.addParameter('alerta', TYPES.NVarChar, alerta);
                
                request.on('requestCompleted', function() {
                    resolve(true);
                });
                
                connection.execSql(request);
            }
        });
    });
}

module.exports = {
    comprobarRegla, procedimientoBorrado
}