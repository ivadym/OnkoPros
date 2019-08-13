const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;

const entrevistaData = require('../models/entrevistasDB');
const valorData = require('../models/valorDB');
const proc = require('../helpers/procedimientos');
const helper = require('../helpers/helperDB');

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
                                return helper.extraerContextoItemHijo(pool, idEntrevistaUsuario, siguienteItem.IdItem, false)
                                .then(ctx => {
                                    if (ctx) { // Item hijo extraído
                                        resolve(ctx);
                                    } else { // No hay más item hijos
                                        return helper.finalizarItemAgrupacion(pool, idEntrevistaUsuario, null, siguienteItem.IdItem, siguienteItem)
                                        .then(obj => {
                                            if (obj && obj.ctx && obj.ctx.IdSiguienteItem) {
                                                resolve(obj.ctx);
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
                            return helper.finalizarEntrevista(pool, idEntrevistaUsuario)
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
 * Extrae el item asociado a un ID determinado y que ya ha sido previamente respondido por el usuario
 */
function extraerItemRespondido(pool, idEntrevistaUsuario, idItem) {
    var query = `SELECT i.IdItem, op_e.IdEntrevista, op_ei.IdAgrupacion, i.Titulo, i.Subtitulo, i.Tooltip, i.TipoItem
                FROM OP_ENTREVISTA op_e INNER JOIN OP_ENTREVISTA_ITEM op_ei ON op_ei.IdEntrevistaUsuario=op_e.IdEntrevistaUsuario
                INNER JOIN GEOP_ITEM i ON i.IdItem=op_ei.IdItem
                WHERE op_e.IdEntrevistaUsuario=@idEntrevistaUsuario AND op_ei.IdItem=@idItem AND op_ei.Estado=1 AND i.Estado=1 AND i.EsAgrupacion=0;`;
    var result = [];
    
    return new Promise(function(resolve, reject) {
        return helper.extraerIdEntrevistaItem(pool, idEntrevistaUsuario, idItem)
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
 * Guarda la respuesta del usuario en la BBDD
 */
function almacenarItem(pool, idUsuario, idPerfil, item) {
    var query = `INSERT INTO OP_ENTREVISTA_ITEM (IdEntrevistaItem, IdEntrevistaUsuario, IdAgrupacion, IdItem, Estado, Orden)
                VALUES ((SELECT ISNULL(MAX(IdEntrevistaItem), 0)+1 FROM OP_ENTREVISTA_ITEM), @idEntrevistaUsuario, @idAgrupacion, @idItem, 1, @orden);`;
    
    return new Promise(function(resolve, reject) {
        return helper.extraerIdEntrevistaUsuario(pool, idUsuario, idPerfil, item.IdEntrevista)
        .then(idEntrevistaUsuario => {
            return helper.extraerOrden(pool, idEntrevistaUsuario)
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
                            return helper.extraerIdEntrevistaItem(pool, idEntrevistaUsuario, item.IdItem)
                            .then(idEntrevistaItem => {
                                return valorData.almacenarValor(pool, idEntrevistaItem, item, 0)
                                .then(item => {
                                    return entrevistaData.actualizarEstadoEntrevista(pool, idEntrevistaUsuario)
                                    .then(res => {
                                        return proc.comprobarRegla(pool, idEntrevistaUsuario, item.IdItem, item)
                                        .then(obj => {
                                            var alertaNivelItem = obj.item.Alerta;
                                            if(obj && obj.ctx && obj.ctx.IdSiguienteItem) {
                                                return helper.guardarContextoSiguienteItem(pool, idEntrevistaUsuario, obj.ctx.IdSiguienteAgrupacion, obj.ctx.IdSiguienteItem)
                                                .then(res => {
                                                    resolve(obj.item);
                                                });
                                            } else {
                                                return helper.actualizarContextoSiguienteItem(pool, idEntrevistaUsuario, obj.item, false)
                                                .then(item => {
                                                    item.Alerta = alertaNivelItem ? alertaNivelItem : item.Alerta;
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
 * Actualiza la respuesta del usuario en la BBDD
 */
function actualizarItem(pool, idEntrevistaUsuario, item) {
    var query = `UPDATE OP_ENTREVISTA_ITEM
                SET FechaRegistro=GETDATE()
                WHERE IdEntrevistaItem=@idEntrevistaItem AND Estado>0;`;
    
    return new Promise(function(resolve, reject) {
        return helper.extraerIdEntrevistaItem(pool, idEntrevistaUsuario, item.IdItem)
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
                                    return helper.actualizarAgrupacionRespondida(pool, idEntrevistaUsuario, item.IdAgrupacion, false)
                                    .then(res => {
                                        return helper.actualizarContextoRegla(pool, idEntrevistaUsuario, item.IdAgrupacion, item)
                                        .then(itemAgrupacion => { // El paso siguiente lo marca el item del nivel más bajo
                                            return helper.actualizarContextoRegla(pool, idEntrevistaUsuario, item.IdItem, item)
                                            .then(item => {
                                                resolve(item);
                                            });
                                        });
                                    });
                                } else {
                                    return helper.actualizarContextoRegla(pool, idEntrevistaUsuario, item.IdItem, item)
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

module.exports = {
    extraerItem, extraerContextoItemSiguiente, extraerIdItemsRespondidos, extraerItemRespondido, almacenarItem, actualizarItem
}
