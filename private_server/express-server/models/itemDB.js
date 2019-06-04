const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;

const entrevistaData = require('../models/entrevistasDB')
const valorData = require('../models/valorDB');

/**
 * Devuelve la siguiente pregunta disponible asociada a un usuario y a una entrevista determinados
 */
function extraerSiguienteItem(pool, idUsuario, idPerfil, idEntrevista) {
    return new Promise(function(resolve, reject) {
        var query = `SELECT TOP 1 i.IdItem, e.IdEntrevista, i.Titulo, i.Subtitulo, i.Tooltip, i.TipoItem, i.EsAgrupacion
                    FROM OP_ENTREVISTA e INNER JOIN GEOP_ENTREVISTA eg ON e.IdEntrevista=eg.IdEntrevista
                    INNER JOIN GEOP_ENTREVISTA_ITEM ei ON e.IdEntrevista=ei.IdEntrevista
                    INNER JOIN GEOP_ITEM i ON ei.IdItem=i.IdItem
                    WHERE e.IdUsuario=@idUsuario AND e.IdPerfil=@idPerfil AND e.IdEntrevista=@idEntrevista AND (e.Estado BETWEEN 0 AND 19) AND eg.Estado=1 AND ei.Estado>0 AND i.Estado=1
                    AND (i.IdItem NOT IN (SELECT op_ei.IdItem FROM OP_ENTREVISTA_ITEM op_ei WHERE op_ei.Estado>0 AND op_ei.IdEntrevistaUsuario=e.IdEntrevistaUsuario))
                    ORDER BY CAST(ei.Orden AS numeric) ASC;`;
        var result = [];

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
                    var siguienteItem = result[0];
                    if (siguienteItem) { // Quedan items
                        if (siguienteItem.EsAgrupacion) { // Es agrupación
                            return extraerItemHijo(pool, idUsuario, idPerfil, idEntrevista, siguienteItem)
                            .then(function(itemHijo) {
                                if (itemHijo) { // Quedan hijos
                                    return valorData.extraerValores(pool, itemHijo) // Extracción de los valores del item hijo
                                    .then(function(res) {
                                        itemHijo.Valores = res;
                                        delete itemHijo['EsAgrupacion'];
                                        resolve(itemHijo); // Se envía al usuario el item hijo
                                    })
                                } else { // No hay más hijos
                                    return finalizarItemAgrupacion(pool, idUsuario, idPerfil, idEntrevista, siguienteItem) // Agrupación respondida
                                    .then(function(res) {
                                        return extraerSiguienteItem(pool, idUsuario, idPerfil, idEntrevista) // Sigue con la extracción
                                        .then(function(res) {
                                            resolve(res);
                                        })
                                    })
                                }
                            })
                        } else { // El item extraído no es agrupación
                            return valorData.extraerValores(pool, siguienteItem) // Devuelve los valores del item correspondiente
                            .then(function(res) {
                                siguienteItem.Valores = res;
                                delete siguienteItem['EsAgrupacion'];
                                resolve(siguienteItem); // Se envía al usuario el item
                            })
                        }
                    } else { // No hay más items
                        return entrevistaData.finalizarEntrevista(pool, idUsuario, idPerfil, idEntrevista) // Estado de la entrevista: Realizada
                        .then(function(res) {
                            resolve(res); // Se devuelve al usuario un null (no hay más items para esta entrevista)
                        })
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
function extraerItemRespondido(pool, idUsuario, idPerfil, idEntrevista, idItem) {
    return new Promise(function(resolve, reject) {
        var query = `SELECT i.IdItem, e.IdEntrevista, ei.IdAgrupacion, i.Titulo, i.Subtitulo, i.Tooltip, i.TipoItem
                    FROM OP_ENTREVISTA e INNER JOIN OP_ENTREVISTA_ITEM ei ON e.IdEntrevistaUsuario=ei.IdEntrevistaUsuario
                    INNER JOIN GEOP_ITEM i ON ei.IdItem=i.IdItem
                    WHERE e.IdUsuario=@idUsuario AND e.IdPerfil=@idPerfil AND e.IdEntrevista=@idEntrevista AND ei.IdItem=@idItem AND (e.Estado BETWEEN 10 AND 19) AND ei.Estado=1 AND i.Estado=1 AND i.EsAgrupacion=0;`;
        var result = [];

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
                        .then(function(valores) {
                            return valorData.extraerIdValoresRespondidos(pool, idUsuario, idPerfil, idEntrevista, idItem)
                            .then(function(valoresRespondidos) {
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
                    } else {
                        reject('Error en la obtención del item respondido previamente por el usuario')
                    }
                });

                connection.execSql(request);
            }
        });
    });
}

/**
 * Devuelve un array de los items contestados anteriormente (no agrupaciones)
 */
function extraerIdItemsRespondidos(pool, idUsuario, idPerfil, idEntrevista) {
    return new Promise(function(resolve, reject) {
        var query = `SELECT op_ei.IdItem
                    FROM OP_ENTREVISTA e INNER JOIN OP_ENTREVISTA_ITEM op_ei ON e.IdEntrevistaUsuario=op_ei.IdEntrevistaUsuario
                    INNER JOIN GEOP_ENTREVISTA_ITEM ei ON op_ei.IdItem=ei.IdItem
                    WHERE e.IdUsuario=@idUsuario AND e.IdPerfil=@idPerfil AND e.IdEntrevista=@idEntrevista AND (e.Estado BETWEEN 10 AND 19) AND ei.Estado=1 AND op_ei.Estado=1
                    ORDER BY CAST(op_ei.Orden AS numeric) ASC;`;
        var result = [];

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
function extraerItemHijo(pool, idUsuario, idPerfil, idEntrevista, itemAgrupacion) {
    return new Promise(function(resolve, reject) {
        var query = `SELECT TOP 1 i.IdItem, @idEntrevista IdEntrevista, ia.IdAgrupacion, i.Titulo, i.Subtitulo, i.Tooltip, i.TipoItem, i.EsAgrupacion
                    FROM GEOP_ITEM i INNER JOIN GEOP_ITEM_AGRUPACION ia ON i.IdItem=ia.IdItem
                    INNER JOIN OP_ENTREVISTA op_e ON op_e.IdEntrevista=@idEntrevista AND op_e.IdUsuario=@idUsuario AND op_e.IdPerfil=@idPerfil AND (op_e.Estado BETWEEN 0 AND 19)
                    WHERE ia.IdAgrupacion=@idAgrupacion AND ia.Estado=1 AND i.Estado=1
                    AND (i.IdItem NOT IN (SELECT op_ei.IdItem FROM OP_ENTREVISTA_ITEM op_ei WHERE op_ei.Estado>0 AND op_ei.IdEntrevistaUsuario=op_e.IdEntrevistaUsuario))
                    ORDER BY CAST(ia.Orden AS numeric) ASC;`;
        var result = [];

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
                        return extraerItemHijo(pool, idUsuario, idPerfil, idEntrevista, itemHijo)
                        .then(function(itemHijoSiguiente) {
                            if (itemHijoSiguiente) { // Quedan items hijos
                                resolve(itemHijoSiguiente);
                            } else { // No hay más items hijos
                                return finalizarItemAgrupacion(pool, idUsuario, idPerfil, idEntrevista, itemHijo) // Item agrupación respondido
                                .then(function(res) {
                                    return extraerItemHijo(pool, idUsuario, idPerfil, idEntrevista, itemAgrupacion) // Sigue el flujo principal
                                    .then(function(res) {
                                        resolve(res);
                                    })
                                })
                            } 
                        })
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
function finalizarItemAgrupacion(pool, idUsuario, idPerfil, idEntrevista, itemAgrupacion) {
    return new Promise(function(resolve, reject) {
        return extraerOrden(pool, idUsuario, idPerfil, idEntrevista)
        .then(orden => {
            var query = `INSERT INTO OP_ENTREVISTA_ITEM (IdEntrevistaItem, IdEntrevistaUsuario, IdAgrupacion, IdItem, Estado, Orden)
                        VALUES ((SELECT ISNULL(MAX(IdEntrevistaItem), 0)+1 FROM OP_ENTREVISTA_ITEM),
                        (SELECT IdEntrevistaUsuario FROM OP_ENTREVISTA WHERE IdUsuario=@idUsuario AND IdPerfil=@idPerfil AND IdEntrevista=@idEntrevista AND (Estado BETWEEN 0 AND 19)), @idAgrupacion, @idItem, 2, @orden);`;
        
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
                    request.addParameter('idAgrupacion', TYPES.Int, itemAgrupacion.IdAgrupacion);
                    request.addParameter('idItem', TYPES.Int, itemAgrupacion.IdItem);
                    request.addParameter('orden', TYPES.VarChar, orden);
                
                    request.on('requestCompleted', function() {
                        resolve(null);
                    });
                
                    connection.execSql(request);
                }
            });
        });
    });
}

/**
 * Guarda la respuesta del usuario en la BBDD
 */
function almacenarItem(pool, idUsuario, idPerfil, item) {
    return new Promise(function(resolve, reject) {
        return extraerOrden(pool, idUsuario, idPerfil, item.IdEntrevista)
        .then(orden => {
            var query = `INSERT INTO OP_ENTREVISTA_ITEM (IdEntrevistaItem, IdEntrevistaUsuario, IdAgrupacion, IdItem, Estado, Orden)
                        VALUES ((SELECT ISNULL(MAX(IdEntrevistaItem), 0)+1 FROM OP_ENTREVISTA_ITEM),
                        (SELECT IdEntrevistaUsuario FROM OP_ENTREVISTA WHERE IdUsuario=@idUsuario AND IdPerfil=@idPerfil AND IdEntrevista=@idEntrevista AND (Estado BETWEEN 0 AND 19)), @idAgrupacion, @idItem, 1, @orden);`;
            
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
                    request.addParameter('idEntrevista', TYPES.Int, item.IdEntrevista);
                    request.addParameter('idAgrupacion', TYPES.Int, item.IdAgrupacion);
                    request.addParameter('idItem', TYPES.Int, item.IdItem);
                    request.addParameter('orden', TYPES.VarChar, orden);
                    
                    request.on('requestCompleted', function() {
                        return valorData.almacenarValor(pool, idUsuario, idPerfil, item, 0)
                        .then(function(res) {
                            return entrevistaData.actualizarEstadoEntrevista(pool, idUsuario, idPerfil, res)
                            .then(function(res) {
                                resolve(res);
                            })
                        })
                    });

                    connection.execSql(request);
                }
            });
        });
    });
}

/**
 * Actualiza la respuesta del usuario en la BBDD
 */
function actualizarItem(pool, idUsuario, idPerfil, item) {
    return new Promise(function(resolve, reject) {
        var query = `UPDATE op_ei
                    SET FechaRegistro=GETDATE()
                    FROM OP_ENTREVISTA_ITEM op_ei INNER JOIN OP_ENTREVISTA op_e on op_ei.IdEntrevistaUsuario=op_e.IdEntrevistaUsuario
                    WHERE op_e.IdUsuario=@idUsuario AND op_e.IdPerfil=@idPerfil AND op_e.IdEntrevista=@idEntrevista AND (op_e.Estado BETWEEN 10 AND 19) AND op_ei.IdItem=@idItem;`;

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
                request.addParameter('idEntrevista', TYPES.Int, item.IdEntrevista);
                request.addParameter('idItem', TYPES.Int, item.IdItem);

                request.on('requestCompleted', function() {
                    return valorData.eliminarValores(pool, idUsuario, idPerfil, item)
                    .then(function(res) {
                        return valorData.almacenarValor(pool, idUsuario, idPerfil, res, 0) // Se almacenan los valores actualizados
                        .then(function(itemOriginal) {
                            resolve(itemOriginal);
                        })
                    })
                });
                
                connection.execSql(request);
            }
        });
    });
}

/**
 * Extrae el siguiente orden de respuesta correspondiente a la tupla enterevista/usuario
 */
function extraerOrden(pool, idUsuario, idPerfil, idEntrevista) {
    return new Promise(function(resolve, reject) {
        var query = `SELECT ISNULL(MAX(CAST(Orden AS numeric)), 0)+1 FROM OP_ENTREVISTA_ITEM op_ei
                    INNER JOIN OP_ENTREVISTA op_e ON op_ei.IdEntrevistaUsuario=op_e.IdEntrevistaUsuario
                    WHERE op_e.IdUsuario=@idUsuario AND op_e.IdPerfil=@idPerfil AND op_e.IdEntrevista=@idEntrevista AND (op_e.Estado BETWEEN 0 AND 19) AND op_ei.Estado>0;`;
        var result = [];
        
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

                request.on('row', function(columns) {
                    var rowObject = {};
                    columns.forEach(function(column) {
                        rowObject = column.value; // Solo guardo los IdItem en el array
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

module.exports = { extraerSiguienteItem, extraerItemRespondido, extraerIdItemsRespondidos, almacenarItem, actualizarItem }
