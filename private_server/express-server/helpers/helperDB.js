const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;

const proc = require('./procedimientos');

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
 * Extrae los item hijos asociados a una agrupación
 */
function extraerContextoItemHijo(pool, idEntrevistaUsuario, idAgrupacion, update) {
    var query = ``;
    var result = [];
    
    if (update) {
        query = `SELECT TOP 1 i.IdItem, i.EsAgrupacion FROM
                GEOP_ITEM_AGRUPACION ia INNER JOIN GEOP_ITEM i on i.idItem=ia.IdItem
                WHERE ia.IdAgrupacion=@idAgrupacion AND ia.Estado=1 AND i.Estado=1
                ORDER BY CAST(ia.Orden AS numeric) ASC;`;     
    } else {
        query = `SELECT TOP 1 i.IdItem, i.EsAgrupacion FROM
                GEOP_ITEM_AGRUPACION ia INNER JOIN GEOP_ITEM i on i.idItem=ia.IdItem
                WHERE ia.IdAgrupacion=@idAgrupacion AND ia.Estado=1 AND i.Estado=1
                AND (i.IdItem NOT IN (SELECT op_ei.IdItem FROM OP_ENTREVISTA_ITEM op_ei WHERE op_ei.Estado>0 AND op_ei.IdEntrevistaUsuario=@idEntrevistaUsuario))
                ORDER BY CAST(ia.Orden AS numeric) ASC;`; 
    }
    
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
                request.addParameter('idAgrupacion', TYPES.Int, idAgrupacion);
                
                request.on('row', function(columns) {
                    var rowObject = {};
                    columns.forEach(function(column) {
                        rowObject[column.metadata.colName] = column.value;
                    });
                    result.push(rowObject);
                });
                
                request.on('requestCompleted', function() {
                    var itemHijo = result[0];
                    if (itemHijo) {
                        if (itemHijo.EsAgrupacion) { // Item hijo es a su vez agrupación
                            return guardarContextoSiguienteAgrupacionPadre(pool, idEntrevistaUsuario, idAgrupacion)
                            .then(res => {
                                return extraerContextoItemHijo(pool, idEntrevistaUsuario, itemHijo.IdItem, update)
                                .then(ctx => {
                                    if (ctx) { // Quedan items hijos
                                        ctx.IdSiguienteAgrupacion = itemHijo.IdItem,
                                        resolve(ctx);
                                    } else { // No quedan más items hijos
                                        return finalizarItemAgrupacion(pool, idEntrevistaUsuario, idAgrupacion, itemHijo.IdItem, itemHjo)
                                        .then(obj => { // Continúa el flujo principal
                                            if(obj && obj.ctx && obj.ctx.IdSiguienteItem) {
                                                resolve(obj.ctx);
                                            } else {
                                                return extraerContextoItemHijo(pool, idEntrevistaUsuario, idAgrupacion, update)
                                                .then(ctx => {
                                                    resolve(ctx);
                                                });
                                            }
                                        });
                                    }
                                });
                            })
                            .catch(error => reject(error)); // Catch de promises anidadas
                        } else { // Item hijo no es agrupación
                            resolve({
                                IdSiguienteAgrupacion: idAgrupacion,
                                IdSiguienteItem: itemHijo.IdItem
                            });
                        }
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
 * Actualiza el siguiente item a extraer por el usuario
 */
function guardarContextoSiguienteItem(pool, idEntrevistaUsuario, idSiguienteAgrupacion, idSiguienteItem) {
    var query = `UPDATE OP_ENTREVISTA
                SET IdSiguienteAgrupacion=@idSiguienteAgrupacion, IdSiguienteItem=@idSiguienteItem
                WHERE IdEntrevistaUsuario=@idEntrevistaUsuario;`;
        
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
 * Guarda el contexto del siguiente item a presentar al usuario
 */
function actualizarContextoSiguienteItem(pool, idEntrevistaUsuario, item, update) {
    var query = ``;
    var result = [];
    
    if (item.IdAgrupacion) { // Extracción del siguiente item a nivel agrupacion
        query = `SELECT i.IdItem, i.EsAgrupacion FROM
                GEOP_ITEM_AGRUPACION ia INNER JOIN GEOP_ITEM i ON i.IdItem=ia.IdItem
                WHERE ia.IdAgrupacion=@idAgrupacion AND ia.Estado=1 AND i.Estado=1
                AND ia.Orden=(SELECT ISNULL(ia_p.Orden, 0)+1 FROM GEOP_ITEM_AGRUPACION ia_p WHERE ia_p.IdAgrupacion=@idAgrupacion AND ia_p.IdItem=@idItem AND ia_p.Estado=1);`;                             
    } else { // Extracción del siguiente item a nivel entrevista
        query = `SELECT TOP 1 i.IdItem, i.EsAgrupacion FROM
                OP_ENTREVISTA op_e INNER JOIN GEOP_ENTREVISTA e ON e.IdEntrevista=op_e.IdEntrevista
                INNER JOIN GEOP_ENTREVISTA_ITEM ei ON ei.IdEntrevista=e.IdEntrevista
                INNER JOIN GEOP_ITEM i ON i.IdItem=ei.IdItem
                WHERE op_e.IdEntrevistaUsuario=@idEntrevistaUsuario AND ei.Estado=1 AND i.Estado=1
                AND i.IdItem NOT IN (SELECT op_ei.IdItem FROM OP_ENTREVISTA_ITEM op_ei WHERE op_ei.IdEntrevistaUsuario=@idEntrevistaUsuario AND op_ei.Estado>0)
                ORDER BY CAST(ei.Orden AS numeric) ASC;`;
    }
    
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
                request.addParameter('idAgrupacion', TYPES.Int, item.IdAgrupacion);
                request.addParameter('idItem', TYPES.Int, item.IdItem);
                
                request.on('row', function(columns) {
                    var rowObject = {};
                    columns.forEach(function(column) {
                        rowObject[column.metadata.colName] = column.value;
                    });
                    result.push(rowObject);
                });
                
                request.on('requestCompleted', function() {
                    var siguienteItem = result[0];
                    if (siguienteItem) { // Item extraído
                        if (siguienteItem.EsAgrupacion) { // Es agrupación
                            return extraerContextoItemHijo(pool, idEntrevistaUsuario, siguienteItem.IdItem, update)
                            .then(ctx => {
                                return guardarContextoSiguienteItem(pool, idEntrevistaUsuario, ctx.IdSiguienteAgrupacion, ctx.IdSiguienteItem)
                                .then(res => {
                                    resolve(item);
                                });
                            })
                            .catch(error => reject(error)); // Catch de promises anidadas
                        } else { // No es agrupación
                            return guardarContextoSiguienteItem(pool, idEntrevistaUsuario, item.IdAgrupacion, siguienteItem.IdItem)
                            .then(res => {
                                resolve(item);
                            })
                            .catch(error => reject(error)); // Catch de promises anidadas
                        }
                    } else if (item.IdAgrupacion) { // No hay más items - AGRUPACIÓN
                        return finalizarItemAgrupacion(pool, idEntrevistaUsuario, null, item.IdAgrupacion, item)
                        .then(obj => {
                            if(obj && obj.ctx && obj.ctx.IdSiguienteItem) {
                                return guardarContextoSiguienteItem(pool, idEntrevistaUsuario, obj.ctx.IdSiguienteAgrupacion, obj.ctx.IdSiguienteItem)
                                .then(res => {
                                    resolve(obj.item);
                                });
                            } else {
                                resolve(obj.item);
                            }
                        })
                        .catch(error => reject(error)); // Catch de promises anidadas
                    } else if (!item.IdAgrupacion) { // No hay más items - ENTREVISTA
                        return finalizarEntrevista(pool, idEntrevistaUsuario)
                        .then(res => {
                            item.Fin = true;
                            resolve(item);
                        })
                        .catch(error => reject(error)); // Catch de promises anidadas
                    }
                });
                
                connection.execSql(request);
            }
        });
    });
}

/**
 * Actualiza la agrupación respondida previamente
 */
function actualizarAgrupacionRespondida(pool, idEntrevistaUsuario, idAgrupacion, anidada) {
    var query = `UPDATE OP_ENTREVISTA_ITEM
                SET FechaRegistro=GETDATE()
                OUTPUT inserted.IdAgrupacion
                WHERE IdEntrevistaUsuario=@idEntrevistaUsuario AND IdItem=@idAgrupacion;`;            
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
                request.addParameter('idAgrupacion', TYPES.Int, idAgrupacion);
                
                request.on('row', function(columns) {
                    var rowObject = {};
                    columns.forEach(function(column) {
                        rowObject[column.metadata.colName] = column.value;
                    });
                    result.push(rowObject);
                });
                
                request.on('requestCompleted', function() {
                    idAgrupacion = result[0] ? result[0].IdAgrupacion : null;
                    if (idAgrupacion) { // Agrupación anidada
                        return actualizarAgrupacionRespondida(pool, idEntrevistaUsuario, idAgrupacion, true)
                        .then(res => {
                            resolve(res);
                        })
                        .catch(error => reject(error)); // Catch de promises anidadas
                    } else if (result[0] || anidada) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                });
                
                connection.execSql(request);
            }
        });
    });
}

/**
 * Actualiza el contexto del siguiente item a partir de la regla aplicada a un item anteriormente respondido
 */
function actualizarContextoRegla(pool, idEntrevistaUsuario, idItem, item) {
    return new Promise(function(resolve, reject) {
        return proc.comprobarRegla(pool, idEntrevistaUsuario, idItem, item)
        .then(obj => {
            if (obj && obj.ctx && (obj.ctx.IdSiguienteItem || obj.ctx.Alerta)) { // Regla cumplida
                if (obj.ctx.EstadoPrev) { // Previamente regla cumplida
                    resolve(obj.item); // Se mantiene el contexto original
                } else { // Previamente regla incumplida
                    return proc.procedimientoBorrado(pool, idEntrevistaUsuario, idItem)
                    .then(res => {
                        if (obj.ctx.IdSiguienteItem) {
                            return guardarContextoSiguienteItem(pool, idEntrevistaUsuario, obj.ctx.IdSiguienteAgrupacion, obj.ctx.IdSiguienteItem)
                            .then(res => {
                                resolve(obj.item);
                            });
                        } else if (obj.ctx.Alerta) {
                            return actualizarContextoSiguienteItem(pool, idEntrevistaUsuario, obj.item, false)
                            .then(item => {
                                resolve(item);
                            });
                        }
                    });
                }
            } else { // Regla incumplida
                if (obj && obj.ctx && obj.ctx.EstadoPrev) { // Previamente regla cumplida
                    return proc.procedimientoBorrado(pool, idEntrevistaUsuario, idItem)
                    .then(res => {
                        return actualizarContextoSiguienteItem(pool, idEntrevistaUsuario, obj.item, false)
                        .then(item => {
                            resolve(item);
                        });
                    });
                } else { // Previamente regla incumplida
                    resolve(obj.item); // Se mantiene el contexto original
                }
            }
        })
        .catch(error => reject(error)); // Catch de promises anidadas
    });
}

/**
 * Finaliza el item agrupación correspondiente a un usuario determinado
 */
function finalizarItemAgrupacion(pool, idEntrevistaUsuario, idAgrupacion, idItem, item) {
    var query = ``;
    
    return new Promise(function(resolve, reject) {
        return actualizarAgrupacionRespondida(pool, idEntrevistaUsuario, idItem, false)
        .then(res => {
            if (res) { // Agrupación finalizada anteriormente, se realiza únicamente el update
                query = ``;
            } else {
                if (idAgrupacion) {
                query = `INSERT INTO OP_ENTREVISTA_ITEM (IdEntrevistaItem, IdEntrevistaUsuario, IdAgrupacion, IdItem, Estado, Orden)
                        VALUES ((SELECT ISNULL(MAX(IdEntrevistaItem), 0)+1 FROM OP_ENTREVISTA_ITEM), @idEntrevistaUsuario, @idAgrupacion, @idItem, 2, @orden);`;
                } else {
                query = `INSERT INTO OP_ENTREVISTA_ITEM (IdEntrevistaItem, IdEntrevistaUsuario, IdAgrupacion, IdItem, Estado, Orden)
                        VALUES ((SELECT ISNULL(MAX(IdEntrevistaItem), 0)+1 FROM OP_ENTREVISTA_ITEM), @idEntrevistaUsuario,
                        (SELECT op_e.IdSiguienteAgrupacionPadre FROM OP_ENTREVISTA op_e WHERE op_e.IdEntrevistaUsuario=@idEntrevistaUsuario),
                        @idItem, 2, @orden);`;
                }
            }
            return extraerOrden(pool, idEntrevistaUsuario)
            .then(orden => {
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
                        request.addParameter('idAgrupacion', TYPES.Int, idAgrupacion);
                        request.addParameter('idItem', TYPES.Int, idItem);
                        request.addParameter('orden', TYPES.VarChar, orden);
                        
                        request.on('requestCompleted', function() {
                            return proc.comprobarRegla(pool, idEntrevistaUsuario, idItem, item)
                            .then(obj => {
                                if (obj && obj.ctx && obj.ctx.IdSiguienteItem) {
                                    resolve(obj);
                                } else {
                                    return guardarContextoSiguienteItem(pool, idEntrevistaUsuario, null, null)
                                    .then(res => {
                                        return guardarContextoSiguienteAgrupacionPadre(pool, idEntrevistaUsuario, null)
                                        .then(res => {
                                            resolve(obj);
                                        });
                                    });
                                }
                            })
                            .catch(error => reject(error)); // Catch de promises anidadas
                        });
                        
                        connection.execSql(request);
                    }
                });
            });
        })
        .catch(error => reject(error)); // Catch de promises anidadas
    });
}

/**
 * Finaliza una entrevista deetrminada (no quedan más items por responder)
 */
function finalizarEntrevista(pool, idEntrevistaUsuario) {
    var query = `UPDATE OP_ENTREVISTA
                SET Estado=20
                WHERE IdEntrevistaUsuario=@idEntrevistaUsuario`;
    
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
                    return guardarContextoSiguienteItem(pool, idEntrevistaUsuario, null, null)
                    .then(res => {
                        return guardarContextoSiguienteAgrupacionPadre(pool, idEntrevistaUsuario, null)
                        .then(res => {
                            resolve(res);
                        });
                    })
                    .catch(error => reject(error)); // Catch de promises anidadas
                });
                
                connection.execSql(request);
            }
        });
    });
}

module.exports = {
    extraerIdEntrevistaUsuario, extraerIdEntrevistaItem, extraerOrden, extraerContextoItemHijo, guardarContextoSiguienteItem,
    guardarContextoSiguienteAgrupacionPadre, actualizarContextoSiguienteItem, actualizarAgrupacionRespondida, actualizarContextoRegla,
    finalizarItemAgrupacion, finalizarEntrevista
};
