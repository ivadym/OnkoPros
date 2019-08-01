const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;

const entrevistaData = require('../models/entrevistasDB');
const valorData = require('../models/valorDB');
const {
    extraerIdEntrevistaUsuario, extraerIdEntrevistaItem, extraerOrden, guardarContextoSiguienteItem,
    guardarContextoSiguienteAgrupacionPadre, comprobarRegla
} = require('../helpers/helperDB');

/**
 * Devuelve la siguiente pregunta asociada a un usuario y a una entrevista determinados
 */
function extraerItem(pool, idEntrevista, idSiguienteAgrupacion, idSiguienteItem) {
    var query = `SELECT i.IdItem, @idEntrevista IdEntrevista, @idSiguienteAgrupacion IdAgrupacion, i.Titulo, i.Subtitulo, i.Tooltip, i.TipoItem
                FROM GEOP_ITEM i
                WHERE i.IdItem=@idSiguienteItem AND i.Estado=1;`;
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
                
                request.addParameter('idEntrevista', TYPES.Int, idEntrevista);
                request.addParameter('idSiguienteAgrupacion', TYPES.Int, idSiguienteAgrupacion);
                request.addParameter('idSiguienteItem', TYPES.Int, idSiguienteItem);
                
                request.on('row', function(columns) {
                    var rowObject = {};
                    columns.forEach(function(column) {
                        rowObject[column.metadata.colName] = column.value;
                    });
                    result.push(rowObject);
                });
                
                request.on('requestCompleted', function() {
                    var siguienteItem = result[0];
                    return valorData.extraerValores(pool, siguienteItem)
                    .then(res => {
                        siguienteItem.Valores = res;
                        resolve(siguienteItem);
                    })
                    .catch(error => reject(error)); // Catch de promises anidadas
                });
                
                connection.execSql(request);
            }
        });
    });
}

/**
 * Extrae el IdAgrupación e IdItem siguientes
 */
function extraerContextoItemSiguiente(pool, idEntrevistaUsuario, opts) {
    var query = ``;
    var result = [];
    
    if (opts['op']) { // Contexto obtenido a partir de la tabla OP_ENTREVISTA
        query = `SELECT op_e.IdSiguienteAgrupacion, op_e.IdSiguienteItem FROM OP_ENTREVISTA op_e
                WHERE op_e.IdEntrevistaUsuario=@identrevistaUsuario;`;
        
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
    } else if (opts['item']) { // Contexto obtenido a partir de IdEntrevistaUsuario
        query = `SELECT TOP 1 i.IdItem, i.EsAgrupacion
                FROM OP_ENTREVISTA op_e INNER JOIN GEOP_ENTREVISTA e ON e.IdEntrevista=op_e.idEntrevista
                INNER JOIN GEOP_ENTREVISTA_ITEM ei ON ei.IdEntrevista=e.IdEntrevista
                INNER JOIN GEOP_ITEM i ON i.IdItem=ei.IdItem
                WHERE op_e.IdEntrevistaUsuario=@idEntrevistaUsuario AND e.Estado=1 AND ei.Estado=1 AND i.Estado=1
                AND i.IdItem NOT IN (SELECT op_ei.IdItem FROM OP_ENTREVISTA_ITEM op_ei WHERE op_ei.IdEntrevistaUsuario=@idEntrevistaUsuario AND op_ei.Estado>0)
                ORDER BY CAST(ei.Orden AS numeric) ASC;`;
        
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
                            rowObject[column.metadata.colName] = column.value;
                        });
                        result.push(rowObject);
                    });
                    
                    request.on('requestCompleted', function() {
                        var siguienteItem = result[0];
                        if (siguienteItem) {
                            if (siguienteItem.EsAgrupacion) { // Es agrupación
                                return extraerContextoItemHijo(pool, idEntrevistaUsuario, siguienteItem.IdItem, false)
                                .then(ctx => {
                                    if (ctx) { // Item hijo extraído
                                        resolve(ctx);
                                    } else { // No hay más item hijos
                                        return finalizarItemAgrupacion(pool, idEntrevistaUsuario, null, siguienteItem.IdItem)
                                        .then(ctx => {
                                            if (ctx && ctx.IdSiguienteItem) {
                                                resolve(ctx);
                                            } else {
                                                return extraerContextoItemSiguiente(pool, idEntrevistaUsuario, opts)
                                                .then(ctx => {
                                                    resolve(ctx);
                                                });
                                            }
                                        });
                                    }
                                })
                                .catch(error => reject(error)); // Catch de promises anidadas
                            } else { // No es agrupación
                                resolve({ 
                                    IdSiguienteAgrupacion: null,
                                    IdSiguienteItem: siguienteItem.IdItem
                                });
                            }
                        } else {
                            return entrevistaData.finalizarEntrevista(pool, idEntrevistaUsuario)
                            .then(res => {
                                resolve(null);
                            })
                            .catch(error => reject(error)); // Catch de promises anidadas
                        }
                    });
                    
                    connection.execSql(request);
                }
            });
        });
    }
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
                                        resolve({
                                            IdSiguienteAgrupacion: itemHijo.IdItem,
                                            IdSiguienteItem: ctx.IdSiguienteItem
                                        });
                                    } else { // No quedan más items hijos
                                        return finalizarItemAgrupacion(pool, idEntrevistaUsuario, idAgrupacion, itemHijo.IdItem)
                                        .then(ctx => { // Continúa el flujo principal
                                            if(ctx && ctx.IdSiguienteItem) {
                                                resolve(ctx);
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
 * Devuelve un array de los items contestados anteriormente
 */
function extraerIdItemsRespondidos(pool, idEntrevistaUsuario) {
    var query = `SELECT op_ei.IdItem
                FROM OP_ENTREVISTA_ITEM op_ei
                WHERE op_ei.IdEntrevistaUsuario=@idEntrevistaUsuario AND op_ei.Estado=1
                ORDER BY CAST(op_ei.Orden AS numeric) ASC;`;
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
                        rowObject = column.value; // Solo guardo los IdItem en el array
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
 * Guarda la respuesta del usuario en la BBDD
 */
function almacenarItem(pool, idUsuario, idPerfil, item) {
    var query = `INSERT INTO OP_ENTREVISTA_ITEM (IdEntrevistaItem, IdEntrevistaUsuario, IdAgrupacion, IdItem, Estado, Orden)
                VALUES ((SELECT ISNULL(MAX(IdEntrevistaItem), 0)+1 FROM OP_ENTREVISTA_ITEM), @idEntrevistaUsuario, @idAgrupacion, @idItem, 1, @orden);`;
    
    return new Promise(function(resolve, reject) {
        return extraerIdEntrevistaUsuario(pool, idUsuario, idPerfil, item.IdEntrevista)
        .then(idEntrevistaUsuario => {
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
                        request.addParameter('idAgrupacion', TYPES.Int, item.IdAgrupacion);
                        request.addParameter('idItem', TYPES.Int, item.IdItem);
                        request.addParameter('orden', TYPES.VarChar, orden);
                        
                        request.on('requestCompleted', function() { // Item guardado
                            return extraerIdEntrevistaItem(pool, idEntrevistaUsuario, item.IdItem)
                            .then(idEntrevistaItem => {
                                return valorData.almacenarValor(pool, idEntrevistaItem, item, 0)
                                .then(item => {
                                    return entrevistaData.actualizarEstadoEntrevista(pool, idEntrevistaUsuario)
                                    .then(res => {
                                        return comprobarRegla(pool, idEntrevistaUsuario, item.IdItem)
                                        .then(ctx => {
                                            if(ctx && ctx.IdSiguienteItem) {
                                                return guardarContextoSiguienteItem(pool, idEntrevistaUsuario, ctx.IdSiguienteAgrupacion, ctx.IdSiguienteItem)
                                                .then(res => {
                                                    resolve(item);
                                                });
                                            } else {
                                                return actualizarContextoSiguienteItem(pool, idEntrevistaUsuario, item, false)
                                                .then(item => {
                                                    resolve(item);
                                                });
                                            }
                                        });
                                    });
                                });
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
 * Extrae el siguiente item a presentar al usuario
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
                        return finalizarItemAgrupacion(pool, idEntrevistaUsuario, null, item.IdAgrupacion)
                        .then(ctx => {
                            if(ctx && ctx.IdSiguienteItem) {
                                return guardarContextoSiguienteItem(pool, idEntrevistaUsuario, ctx.IdSiguienteAgrupacion, ctx.IdSiguienteItem)
                                .then(res => {
                                    resolve(item);
                                });
                            } else {
                                resolve(item);
                            }
                        })
                        .catch(error => reject(error)); // Catch de promises anidadas
                    } else if (!item.IdAgrupacion) { // No hay más items - ENTREVISTA
                        return entrevistaData.finalizarEntrevista(pool, idEntrevistaUsuario)
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
 * Finaliza el item agrupación correspondiente a un usuario determinado
 */
function finalizarItemAgrupacion(pool, idEntrevistaUsuario, idAgrupacion, idItem) {
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
                            return comprobarRegla(pool, idEntrevistaUsuario, idItem)
                            .then(ctx => {
                                if (ctx && ctx.IdSiguienteItem) {
                                    resolve(ctx);
                                } else {
                                    return guardarContextoSiguienteItem(pool, idEntrevistaUsuario, null, null)
                                    .then(res => {
                                        return guardarContextoSiguienteAgrupacionPadre(pool, idEntrevistaUsuario, null)
                                        .then(res => {
                                            resolve(res);
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
 * Extrae el item asociado a un ID determinado y que ya ha sido previamente respondido por el usuario
 */
function extraerItemRespondido(pool, idEntrevistaUsuario, idItem) {
    var query = `SELECT i.IdItem, op_e.IdEntrevista, op_ei.IdAgrupacion, i.Titulo, i.Subtitulo, i.Tooltip, i.TipoItem
                FROM OP_ENTREVISTA op_e INNER JOIN OP_ENTREVISTA_ITEM op_ei ON op_ei.IdEntrevistaUsuario=op_e.IdEntrevistaUsuario
                INNER JOIN GEOP_ITEM i ON i.IdItem=op_ei.IdItem
                WHERE op_e.IdEntrevistaUsuario=@idEntrevistaUsuario AND op_ei.IdItem=@idItem AND op_ei.Estado=1 AND i.Estado=1 AND i.EsAgrupacion=0;`;
    var result = [];
    
    return new Promise(function(resolve, reject) {
        return extraerIdEntrevistaItem(pool, idEntrevistaUsuario, idItem)
        .then(idEntrevistaItem => {
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
                            rowObject[column.metadata.colName] = column.value;
                        });
                        result.push(rowObject);
                    });
                    
                    request.on('requestCompleted', function() {
                        var itemAnterior = result[0];
                        if (itemAnterior) {
                            return valorData.extraerValores(pool, itemAnterior)
                            .then(valores => {
                                return valorData.extraerIdValoresSeleccionados(pool, idEntrevistaItem) // Valores respondidos
                                .then(valoresSeleccionados => {
                                    for (var i = 0; i < valores.length; i++) {
                                        valores[i].Seleccionado = false;
                                        valores[i].ValorTexto = null;
                                        for (var j = 0; j < valoresSeleccionados.length; j++) {
                                            if (valores[i].IdValor === valoresSeleccionados[j].IdValor) { // Valor seleccionado previamente
                                                valores[i].Seleccionado = true;
                                                valores[i].ValorTexto = valoresSeleccionados[j].ValorTexto;
                                            }
                                        }
                                    }
                                    
                                    itemAnterior.Valores = valores;
                                    resolve(itemAnterior); // Envío del item
                                });
                            })
                            .catch(error => reject(error)); // Catch de promises anidadas
                        } else {
                            reject('Error en la obtención del item respondido previamente por el usuario');
                        }
                    });
                    
                    connection.execSql(request);
                }
            });
        })
        .catch(error => reject(error)); // Catch de promises anidadas
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
 * Actualiza la respuesta del usuario en la BBDD
 */
function actualizarItem(pool, idEntrevistaUsuario, item) {
    var query = `UPDATE OP_ENTREVISTA_ITEM
                SET FechaRegistro=GETDATE()
                WHERE IdEntrevistaItem=@idEntrevistaItem;`;
    
    return new Promise(function(resolve, reject) {
        return extraerIdEntrevistaItem(pool, idEntrevistaUsuario, item.IdItem)
        .then(idEntrevistaItem => {
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
                    
                    request.addParameter('idEntrevistaItem', TYPES.Int, idEntrevistaItem);
                    
                    request.on('requestCompleted', function() {
                        return valorData.eliminarValor(pool, idEntrevistaItem, item)
                        .then(item => {
                            return valorData.almacenarValor(pool, idEntrevistaItem, item, 0) // Se almacenan los valores actualizados
                            .then(item => {
                                if (item.IdAgrupacion) {
                                    return actualizarAgrupacionRespondida(pool, idEntrevistaUsuario, item.IdAgrupacion, false)
                                    .then(res => {
                                        return actualizarContextoRegla(pool, idEntrevistaUsuario, item.IdAgrupacion, item)
                                        .then(item => {
                                            return actualizarContextoRegla(pool, idEntrevistaUsuario, item.IdItem, item)
                                            .then(item => {
                                                resolve(item);
                                            });
                                        });
                                    });
                                } else {
                                    return actualizarContextoRegla(pool, idEntrevistaUsuario, item.IdItem, item)
                                    .then(item => {
                                        resolve(item);
                                    });
                                }
                            });
                        })
                        .catch(error => reject(error)); // Catch de promises anidadas
                    });
                    
                    connection.execSql(request);
                }
            });
        })
        .catch(error => reject(error)); // Catch de promises anidadas
    });
}

/**
 * Devuelve un array de los items contestados anteriormente
 */
function extraerIdItemsRespondidosOrdenSiguiente(pool, idEntrevistaUsuario, idItem) {
    var query = `SELECT op_ei.IdEntrevistaItem
                FROM OP_ENTREVISTA_ITEM op_ei
                WHERE op_ei.IdEntrevistaUsuario=@idEntrevistaUsuario AND op_ei.Orden> (SELECT op_ei.Orden FROM OP_ENTREVISTA_ITEM op_ei WHERE op_ei.IdEntrevistaUsuario=@idEntrevistaUsuario AND op_ei.IdItem=@idItem);`;
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
                        rowObject = column.value; // Solo guardo los IdEntrevistaItem en el array
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
 * Elimina el item especificado y previamente contestado
 */
function eliminarItems(pool, idEntrevistaItem) {
    var query = `DELETE op_ei
                FROM OP_ENTREVISTA_ITEM op_ei
                WHERE op_ei.IdEntrevistaItem>=@idEntrevistaItem AND op_ei.Estado>0;`;
    
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
                
                request.addParameter('idEntrevistaItem', TYPES.Int, idEntrevistaItem);
                
                request.on('requestCompleted', function() {
                    resolve(true);
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
        return comprobarRegla(pool, idEntrevistaUsuario, idItem)
        .then(ctx => {
            if (ctx && ctx.IdSiguienteItem) { // Regla cumplida
                if (ctx.Prev) { // Previamente regla cumplida
                    resolve(item); // Se mantiene el contexto original
                } else { // Previamente regla incumplida
                    return extraerIdItemsRespondidosOrdenSiguiente(pool, idEntrevistaUsuario, idItem)
                    .then(ids => {
                        return valorData.eliminarValores(pool, ids, 0)
                        .then(res => {
                            return eliminarItems(pool, ids[0])
                            .then(res => {
                                return guardarContextoSiguienteItem(pool, idEntrevistaUsuario, ctx.IdSiguienteAgrupacion, ctx.IdSiguienteItem)
                                .then(res => {
                                    resolve(item);
                                });
                            });
                        });
                    });
                }
            } else { // Regla incumplida
                if (ctx && ctx.Prev) { // Previamente regla cumplida
                    return extraerIdItemsRespondidosOrdenSiguiente(pool, idEntrevistaUsuario, idItem)
                    .then(ids => {
                        return valorData.eliminarValores(pool, ids, 0)
                        .then(res => {
                            return eliminarItems(pool, ids[0])
                            .then(res => {
                                return actualizarContextoSiguienteItem(pool, idEntrevistaUsuario, item, false)
                                .then(item => {
                                    resolve(item);
                                });
                            });
                        });
                    });
                } else { // Previamente regla incumplida
                    resolve(item); // Se mantiene el contexto original
                }
            }
        })
        .catch(error => reject(error)); // Catch de promises anidadas
    });
}

/**
 * Elimina los valores contestados previamente por el usuario
 */
function eliminarReglas(pool, idEntrevistaUsuario, ids, index) {
    var query = `DELETE op_er
                FROM OP_ENTREVISTA_REGLA op_er INNER JOIN GEOP_ITEM_REGLA ir ON ir.IdRegla=op_er.IdRegla
                INNER JOIN OP_ENTREVISTA_ITEM op_ei ON op_ei.IdItem=ir.IdItem
                WHERE op_ei.IdEntrevistaItem=@idEntrevistaItem AND op_er.IdEntrevistaUsuario=@idEntrevistaUsuario AND op_er.Estado=1 AND ir.Estado=1 AND op_ei.Estado>0;`;
    
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
                request.addParameter('idEntrevistaItem', TYPES.Int, ids[index]);
                
                request.on('requestCompleted', function() {
                    if (ids[++index]) {
                        return eliminarReglas(pool, idEntrevistaUsuario, ids, index)
                        .then(res => {
                            resolve(res);
                        })
                        .catch(error => reject(error)); // Catch de promises anidadas
                    } else {
                        resolve(true);
                    }
                });
                
                connection.execSql(request);
            }
        });
    });
}

module.exports = {
    extraerItem, extraerContextoItemSiguiente, extraerIdItemsRespondidos, almacenarItem, extraerItemRespondido, actualizarItem
}
