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
 * Actualiza el siguiente item a extraer por el usuario
 */
function guardarContextoSiguienteItem(pool, idEntrevistaUsuario, idSiguienteAgrupacion, idSiguienteItem) {
    var query = `UPDATE OP_ENTREVISTA
                SET IdSiguienteAgrupacion=@idSiguienteAgrupacion, IdSiguienteItem=@idSiguienteItem
                WHERE IdEntrevistaUsuario=@idEntrevistaUsuario;`;
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
                request.addParameter('idSiguienteAgrupacion', TYPES.Int, idSiguienteAgrupacion);
                request.addParameter('idSiguienteItem', TYPES.Int, idSiguienteItem);
                
                request.on('requestCompleted', function() {
                    resolve(true);
                });
                
                connection.execSql(request);
            }
        });
    });
}

/**
 * Actualiza el contexto del item padre de agrupación
 */
function guardarContextoSiguienteAgrupacionPadre(pool, idEntrevistaUsuario, idPadre) {
    var query = `UPDATE OP_ENTREVISTA
                SET IdSiguienteAgrupacionPadre=@idPadre
                WHERE IdEntrevistaUsuario=@idEntrevistaUsuario;`;
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
                request.addParameter('idPadre', TYPES.Int, idPadre);
                
                request.on('requestCompleted', function() {
                    resolve(true);
                });
                
                connection.execSql(request);
            }
        });
    });
}

/**
 * Extrae las reglas a ejecutar asociadas a una agrupación y ejecuta los procedimientos almacenados correspondientes
 */
function comprobarRegla(pool, idEntrevistaUsuario, idItem) {
    var query = `SELECT r.IdRegla, r.ProcedimientoSQL, r.IdAgrupacionSalto, r.IdItemSalto, r.UmbralSalto
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
                        return ejecutarProcedimiento(pool, idEntrevistaUsuario, idItem, result, 0)
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
function ejecutarProcedimiento(pool, idEntrevistaUsuario, idItem, regla, index) {
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
                request.addParameter('idItem', TYPES.Int, idItem);
                request.addOutputParameter('resultado', TYPES.Numeric, -2, {"precision": 18, "scale": 2});
                
                request.on('returnValue', function(parameterName, value, metadata) {
                    result = value;
                });
                
                request.on('requestCompleted', function() {
                    var ctx = null;
                    
                    if (regla[index].IdItemSalto && regla[index].UmbralSalto && result >= regla[index].UmbralSalto) {
                        ctx = {
                            IdRegla: regla[index].IdRegla,
                            IdSiguienteAgrupacion: regla[index].IdAgrupacionSalto,
                            IdSiguienteItem: regla[index].IdItemSalto
                        };
                    }
                    
                    if (regla[++index]) { // Quedan más reglas asociadas a una agrupación
                        return ejecutarProcedimiento(pool, idEntrevistaUsuario, idItem, regla, index)
                        .then(res => {
                            if (res) {
                                resolve(res);
                            } else {
                                resolve(ctx);
                            }
                        })
                        .catch(error => reject(error)); // Catch de promises anidadas
                    } else {
                        resolve(ctx);
                    }
                });
                
                connection.callProcedure(request);
            }
        });
    });
}

module.exports = {
    extraerIdEntrevistaUsuario, extraerIdEntrevistaItem, extraerOrden, guardarContextoSiguienteItem,
    guardarContextoSiguienteAgrupacionPadre, comprobarRegla
};
