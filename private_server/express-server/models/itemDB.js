const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;

const entrevistaData = require('../models/entrevistasDB')
const valorData = require('../models/valorDB');
const { extraerIdEntrevistaUsuario, extraerIdEntrevistaItem, extraerOrden } = require('../helpers/helperDB');

/**
 * Devuelve la siguiente pregunta disponible asociada a un usuario y a una entrevista determinados
 */
function extraerSiguienteItem(pool, idEntrevistaUsuario) {
    var query = `SELECT TOP 1 i.IdItem, op_e.IdEntrevista, i.Titulo, i.Subtitulo, i.Tooltip, i.TipoItem, i.EsAgrupacion
                FROM OP_ENTREVISTA op_e INNER JOIN GEOP_ENTREVISTA e ON op_e.IdEntrevista=e.IdEntrevista
                INNER JOIN GEOP_ENTREVISTA_ITEM ei ON ei.IdEntrevista=op_e.IdEntrevista
                INNER JOIN GEOP_ITEM i ON i.IdItem=ei.IdItem
                WHERE op_e.IdEntrevistaUsuario=@idEntrevistaUsuario AND e.Estado=1 AND ei.Estado>0 AND i.Estado=1
                AND (i.IdItem NOT IN (SELECT op_ei.IdItem FROM OP_ENTREVISTA_ITEM op_ei WHERE op_ei.Estado>0 AND op_ei.IdEntrevistaUsuario=@idEntrevistaUsuario))
                ORDER BY CAST(ei.Orden AS numeric) ASC;`;
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
                        rowObject[column.metadata.colName] = column.value;
                    });
                    result.push(rowObject);
                });
                
                request.on('requestCompleted', function() {
                    var siguienteItem = result[0];
                    if (siguienteItem) { // Quedan items
                        if (siguienteItem.EsAgrupacion) { // Es agrupación
                            return extraerItemHijo(pool, idEntrevistaUsuario, siguienteItem.IdEntrevista, siguienteItem)
                            .then(itemHijo => {
                                if (itemHijo) { // Quedan hijos
                                    return valorData.extraerValores(pool, itemHijo) // Extracción de los valores del item hijo
                                    .then(res => {
                                        itemHijo.Valores = res;
                                        delete itemHijo['EsAgrupacion'];
                                        resolve(itemHijo); // Se envía al usuario el item hijo
                                    })
                                } else { // No hay más hijos
                                    return finalizarItemAgrupacion(pool, idEntrevistaUsuario, siguienteItem) // Agrupación respondida
                                    .then(res => {
                                        return extraerSiguienteItem(pool, idEntrevistaUsuario) // Sigue con la extracción
                                        .then(res => {
                                            resolve(res);
                                        })
                                    })
                                }
                            })
                            .catch(error => reject(error)); // Catch de promises anidadas
                        } else { // El item extraído no es agrupación
                            return valorData.extraerValores(pool, siguienteItem) // Devuelve los valores del item correspondiente
                            .then(res => {
                                siguienteItem.Valores = res;
                                delete siguienteItem['EsAgrupacion'];
                                resolve(siguienteItem); // Se envía al usuario el item
                            })
                            .catch(error => reject(error)); // Catch de promises anidadas
                        }
                    } else { // No hay más items
                        return entrevistaData.finalizarEntrevista(pool, idEntrevistaUsuario) // Estado de la entrevista: Realizada
                        .then(res => {
                            resolve(res); // Se devuelve al usuario un null (no hay más items para esta entrevista)
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
                        if (result[0]) {
                            return valorData.extraerValores(pool, result[0]) // Devuelve los valores del item correspondiente
                            .then(valores => {
                                return valorData.extraerIdValoresRespondidos(pool, idEntrevistaItem)
                                .then(valoresRespondidos => {
                                    for (var i = 0; i < valores.length; i++) {
                                        valores[i].Seleccionado = false;
                                        valores[i].ValorTexto = null;
                                        for (var j = 0; j < valoresRespondidos.length; j++) {
                                            if (valores[i].IdValor === valoresRespondidos[j].IdValor) { // Valor seleccionado previamente
                                                valores[i].Seleccionado = true;
                                                valores[i].ValorTexto = valoresRespondidos[j].ValorTexto;
                                            }
                                        }
                                    }
                                    result[0].Valores = valores;
                                    resolve(result[0]); // Envío del item
                                })
                            })
                            .catch(error => reject(error)); // Catch de promises anidadas
                        } else {
                            reject('Error en la obtención del item respondido previamente por el usuario')
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
 * Devuelve un array de los items contestados anteriormente (no agrupaciones)
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
 * Extrae los item hijos asociados a una agrupación
 */
function extraerItemHijo(pool, idEntrevistaUsuario, idEntrevista, itemAgrupacion) {
    var query = `SELECT TOP 1 i.IdItem, @idEntrevista IdEntrevista, ia.IdAgrupacion, i.Titulo, i.Subtitulo, i.Tooltip, i.TipoItem, i.EsAgrupacion
                FROM GEOP_ITEM i INNER JOIN GEOP_ITEM_AGRUPACION ia ON ia.IdItem=i.IdItem
                INNER JOIN OP_ENTREVISTA op_e ON op_e.IdEntrevistaUsuario=@idEntrevistaUsuario
                WHERE ia.IdAgrupacion=@idAgrupacion AND ia.Estado=1 AND i.Estado=1
                AND (i.IdItem NOT IN (SELECT op_ei.IdItem FROM OP_ENTREVISTA_ITEM op_ei WHERE op_ei.Estado>0 AND op_ei.IdEntrevistaUsuario=@idEntrevistaUsuario))
                ORDER BY CAST(ia.Orden AS numeric) ASC;`;
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
                request.addParameter('idEntrevista', TYPES.Int, idEntrevista);
                request.addParameter('idAgrupacion', TYPES.Int, itemAgrupacion.IdItem);

                request.on('row', function(columns) {
                    var rowObject = {};
                    columns.forEach(function(column) {
                        rowObject[column.metadata.colName] = column.value;
                    });
                    result.push(rowObject);
                });

                request.on('requestCompleted', function() {
                    var itemHijo = result[0];
                    if (itemHijo && itemHijo.EsAgrupacion) { // Item hijo es a su vez agrupación
                        return extraerItemHijo(pool, idEntrevistaUsuario, idEntrevista, itemHijo)
                        .then(itemHijoSiguiente => {
                            if (itemHijoSiguiente) { // Quedan items hijos
                                resolve(itemHijoSiguiente);
                            } else { // No hay más items hijos
                                return finalizarItemAgrupacion(pool, idEntrevistaUsuario, itemHijo) // Item agrupación respondido
                                .then(res => {
                                    return extraerItemHijo(pool, idEntrevistaUsuario, idEntrevista, itemAgrupacion) // Sigue el flujo principal
                                    .then(res => {
                                        resolve(res);
                                    })
                                })
                            } 
                        })
                        .catch(error => reject(error)); // Catch de promises anidadas
                    } else {
                        resolve(itemHijo);
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
function finalizarItemAgrupacion(pool, idEntrevistaUsuario, itemAgrupacion) {
    var query = `INSERT INTO OP_ENTREVISTA_ITEM (IdEntrevistaItem, IdEntrevistaUsuario, IdAgrupacion, IdItem, Estado, Orden)
                VALUES ((SELECT ISNULL(MAX(IdEntrevistaItem), 0)+1 FROM OP_ENTREVISTA_ITEM), @idEntrevistaUsuario, @idAgrupacion, @idItem, 2, @orden);`;
        
    return new Promise(function(resolve, reject) {
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
                    request.addParameter('idAgrupacion', TYPES.Int, itemAgrupacion.IdAgrupacion);
                    request.addParameter('idItem', TYPES.Int, itemAgrupacion.IdItem);
                    request.addParameter('orden', TYPES.VarChar, orden);
                
                    request.on('requestCompleted', function() {
                        resolve(null);
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
                        
                        request.on('requestCompleted', function() {
                            return extraerIdEntrevistaItem(pool, idEntrevistaUsuario, item.IdItem)
                            .then(idEntrevistaItem => {
                                return valorData.almacenarValor(pool, idEntrevistaItem, item, 0)
                                .then(item => {
                                    return entrevistaData.actualizarEstadoEntrevista(pool, idEntrevistaUsuario, item)
                                    .then(item => {
                                        resolve(item);
                                    })
                                })
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
function actualizarItem(pool, idUsuario, idPerfil, item) {
    var query = `UPDATE OP_ENTREVISTA_ITEM
                SET FechaRegistro=GETDATE()
                WHERE IdEntrevistaItem=@idEntrevistaItem;`;
    
    return new Promise(function(resolve, reject) {
        return extraerIdEntrevistaUsuario(pool, idUsuario, idPerfil, item.IdEntrevista)
        .then(idEntrevistaUsuario => {
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
                            return valorData.eliminarValores(pool, idEntrevistaItem, item)
                            .then(item => {
                                return valorData.almacenarValor(pool, idEntrevistaItem, item, 0) // Se almacenan los valores actualizados
                                .then(item => {
                                    resolve(item);
                                })
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

module.exports = { extraerSiguienteItem, extraerItemRespondido, extraerIdItemsRespondidos, almacenarItem, actualizarItem }
