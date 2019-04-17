const Connection = require('tedious').Connection;
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;

const config = require('../helpers/config');

/**
 * Devuelve la siguiente pregunta disponible asociada a un usuario y a una entrevista determinados
 */
exports.extraerItem = function(idUsuario, idPerfil, idEntrevista) {
    return new Promise(function(resolve, reject) {
        var connection = new Connection(config.auth);
        var query = `SELECT TOP 1 i.IdItem, e.IdEntrevista, i.Titulo, i.Tooltip, i.TipoItem, i.EsPadre, i.IdEntrevistaPadre
                    FROM OP_ENTREVISTA e INNER JOIN GEOP_ENTREVISTA eg ON e.IdEntrevista=eg.IdEntrevista
                    INNER JOIN GEOP_ENTREVISTA_ITEM ei ON e.IdEntrevista=ei.IdEntrevista
                    INNER JOIN GEOP_ITEM i ON ei.IdItem=i.IdItem
                    WHERE e.IdUsuario=@idUsuario AND e.IdPerfil=@idPerfil AND e.IdEntrevista=@idEntrevista AND (e.Estado BETWEEN 0 AND 19) AND eg.Estado=1
                    AND (i.IdItem NOT IN (SELECT op_ei.IdItem FROM OP_ENTREVISTA_ITEM op_ei WHERE op_ei.Estado>0 AND op_ei.IdEntrevistaUsuario=(SELECT op_e.IdEntrevistaUsuario FROM OP_ENTREVISTA op_e WHERE op_e.IdUsuario=@idUsuario AND op_e.IdPerfil=@idPerfil AND op_e.IdEntrevista=@idEntrevista AND op_e.Estado BETWEEN 0 AND 19)))
                    AND ei.Estado=1 AND i.Estado=1
                    AND (@fechaActual BETWEEN e.FechaInicio AND e.FechaLimite)
                    ORDER BY len(ei.Orden), ei.Orden ASC;`;
        var result = [];

        connection.on('connect', function(err) {
            if (err) {
                reject(err);
            } else {
                request = new Request(query, function(err, rowCount, rows) {
                    if (err) {
                        reject(err);
                    }
                    connection.close();
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
                
                request.on('requestCompleted', function () {
                    var siguienteItem = result[0];
                    if(siguienteItem) { // Quedan items
                        if(siguienteItem.EsPadre) {
                            extraerItemHijo(idUsuario, idPerfil, idEntrevista, siguienteItem)
                            .then(function(itemHijo) {
                                if(itemHijo) { // Quedan más hijos
                                    extraerValores(itemHijo) // Extracción de los valores del item hijo
                                    .then(function(res) {
                                        itemHijo.IdEntrevista = idEntrevista; // Hijo hereda el ID del padre
                                        itemHijo.Valores = res;
                                        delete itemHijo['EsPadre'];
                                        delete itemHijo['IdEntrevistaPadre'];
                                        resolve(itemHijo); // Se envía al usuario el item hijo
                                    })
                                    .catch(function(error) {
                                        resolve(error);
                                    });
                                } else { // No hay más hijos
                                    finalizarItemPadre(idUsuario, idPerfil, siguienteItem.IdEntrevista, siguienteItem) // Item padre respondido
                                    .then(function(res) {
                                        exports.extraerItem(idUsuario, idPerfil, idEntrevista) // Sigue con la extracción
                                        .then(function(res) {
                                            resolve(res);
                                        })
                                        .catch(function(error) {
                                            resolve(error);
                                        });
                                    })
                                    .catch(function(error) {
                                        resolve(error);
                                    });
                                }
                            })
                            .catch(function(error) {
                                resolve(error);
                            });

                        } else { // El item extraído no es padre
                            extraerValores(siguienteItem) // Devuelve los valores del item correspondiente
                            .then(function(res) {
                                siguienteItem.Valores = res;
                                delete siguienteItem['EsPadre'];
                                delete siguienteItem['IdEntrevistaPadre'];
                                resolve(siguienteItem); // Se envía al usuario el item
                            })
                            .catch(function(error) {
                                resolve(error);
                            });
                        }
                    } else { // No hay más items
                        finalizarEntrevista(idUsuario, idPerfil, idEntrevista) // Estado de la entrevista: Realizada
                        .then(function(res) {
                            resolve(res); // Se devuelve al usuario un null (no hay más items para esta entrevista)
                        })
                        .catch(function(error) {
                            resolve(error);
                        });
                    }
                });

                connection.execSql(request);
            }
        });
    });
}

/**
 * Extrae los item hijos asociados a un item padre (entrevista padre)
 */
function extraerItemHijo(idUsuario, idPerfil, idEntrevistaPrincipal, itemPadre) {
    return new Promise(function(resolve, reject) {
        var connection = new Connection(config.auth);
        var query = `SELECT TOP 1 i.IdItem, eg.IdEntrevista, i.Titulo, i.Tooltip, i.TipoItem, i.EsPadre, i.IdEntrevistaPadre
                    FROM GEOP_ENTREVISTA eg INNER JOIN GEOP_ENTREVISTA_ITEM ei ON eg.IdEntrevista=ei.IdEntrevista
                    INNER JOIN GEOP_ITEM i ON ei.IdItem=i.IdItem
                    WHERE eg.IdEntrevista=@idEntrevista AND eg.Estado=1 AND ei.Estado=1 AND i.Estado=1
                    AND (i.IdItem NOT IN (SELECT op_ei.IdItem FROM OP_ENTREVISTA_ITEM op_ei WHERE op_ei.Estado>0 AND op_ei.IdEntrevistaUsuario=(SELECT op_e.IdEntrevistaUsuario FROM OP_ENTREVISTA op_e WHERE op_e.IdUsuario=@idUsuario AND op_e.IdPerfil=@idPerfil AND op_e.IdEntrevista=@idEntrevistaPrincipal AND op_e.Estado BETWEEN 0 AND 19)))
                    ORDER BY len(ei.Orden), ei.Orden ASC;`;
        var result = [];

        connection.on('connect', function(err) {
            if (err) {
                reject(err);
            } else {
                request = new Request(query, function(err, rowCount, rows) {
                    if (err) {
                        reject(err);
                    }
                    connection.close();
                });

                request.addParameter('idUsuario', TYPES.Int, idUsuario);
                request.addParameter('idPerfil', TYPES.Int, idPerfil);
                request.addParameter('idEntrevista', TYPES.Int, itemPadre.IdEntrevistaPadre);
                request.addParameter('idEntrevistaPrincipal', TYPES.Int, idEntrevistaPrincipal);

                request.on('row', function(columns) {
                    var rowObject = {};
                    columns.forEach(function(column) {
                        rowObject[column.metadata.colName] = column.value;
                    });
                    result.push(rowObject);
                });

                request.on('requestCompleted', function () {
                    var itemHijo = result[0];
                    if(itemHijo && itemHijo.EsPadre) { // Item hijo es a su vez padre
                        extraerItemHijo(idUsuario, idPerfil, idEntrevistaPrincipal, itemHijo)
                        .then(function(itemHijoSiguiente) {
                            if(itemHijoSiguiente) { // Quedan items hijos
                                resolve(itemHijoSiguiente);
                            } else { // No hay más items hijos
                                finalizarItemPadre(idUsuario, idPerfil, idEntrevistaPrincipal, itemHijo) // Item padre respondido
                                    .then(function(res) {
                                        extraerItemHijo(idUsuario, idPerfil, idEntrevistaPrincipal, itemPadre)
                                        .then(function(res) {
                                            resolve(res);
                                        })
                                        .catch(function(error) {
                                            resolve(error);
                                        });
                                    })
                                    .catch(function(error) {
                                        resolve(error);
                                    });
                            }
                            
                        })
                        .catch(function(error) {
                            resolve(error);
                        });
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
 * Extrae los valores asociados a un item determinado
 */
function extraerValores(item) {
    return new Promise(function(resolve, reject) {
        var connection = new Connection(config.auth);
        var query = `SELECT v.IdItemValor, v.Titulo, v.Tooltip, v.Valor, v.TipoValor, v.VisibleValor, v.CajaTexto, v.ValorTexto, v.Alerta, v.AlertaTexto
                    FROM GEOP_ENTREVISTA eg INNER JOIN GEOP_ENTREVISTA_ITEM ei ON eg.IdEntrevista=ei.IdEntrevista
                    INNER JOIN GEOP_ITEM i ON ei.IdItem=i.IdItem
                    INNER JOIN GEOP_ITEM_VALOR v ON i.IdItem=v.IdItem
                    WHERE eg.IdEntrevista=@idEntrevista AND i.IdItem=@idItem AND eg.Estado=1 AND ei.Estado=1 AND i.Estado=1 AND v.Estado=1
                    ORDER BY len(v.Orden), v.Orden ASC;`;
        var result = [];

        connection.on('connect', function(err) {
            if (err) {
                reject(err);
            } else {
                request = new Request(query, function(err, rowCount, rows) {
                    if (err) {
                        reject(err);
                    }
                    connection.close();
                });

                request.addParameter('idEntrevista', TYPES.Int, item.IdEntrevista);
                request.addParameter('idItem', TYPES.Int, item.IdItem);

                request.on('row', function(columns) {
                    var rowObject = {};
                    columns.forEach(function(column) {
                        rowObject[column.metadata.colName] = column.value;
                    });
                    result.push(rowObject);
                });

                request.on('requestCompleted', function () {
                    resolve(result);
                });

                connection.execSql(request);
            }
        });
    });
}

/**
 * Finaliza el item padre correspondiente a un usuario determinado
 */
function finalizarItemPadre(idUsuario, idPerfil, idEntrevistaPrincipal, itemPadre) {
    return new Promise(function(resolve, reject) {
        var connection = new Connection(config.auth);
        var query = `INSERT INTO OP_ENTREVISTA_ITEM (IdEntrevistaItem, IdEntrevistaUsuario, IdItem, Estado)
                    VALUES ((SELECT ISNULL(MAX(IdEntrevistaItem), 0)+1 FROM OP_ENTREVISTA_ITEM),
                    (SELECT IdEntrevistaUsuario FROM OP_ENTREVISTA WHERE IdUsuario=@idUsuario AND IdPerfil=@idPerfil AND IdEntrevista=@idEntrevista AND (Estado BETWEEN 0 AND 19)), @idItem, 2);`

        connection.on('connect', function(err) {
            if (err) {
                reject(err);
            } else {
                request = new Request(query, function(err, rowCount, rows) {
                    if (err) {
                        reject(err);
                    }
                    connection.close();
                });

                request.addParameter('idUsuario', TYPES.Int, idUsuario);
                request.addParameter('idPerfil', TYPES.Int, idPerfil);
                request.addParameter('idEntrevista', TYPES.Int, idEntrevistaPrincipal);
                request.addParameter('idItem', TYPES.Int, itemPadre.IdItem);

                request.on('requestCompleted', function () {
                    resolve(null);
                });

                connection.execSql(request);
            }
        });
    });
}

/**
 * Finaliza la entrevista actual (no quedan más items por responder)
 */
function finalizarEntrevista(idUsuario, idPerfil, idEntrevista) {
    return new Promise(function(resolve, reject) {
        var connection = new Connection(config.auth);
        var query = `UPDATE OP_ENTREVISTA
                    SET Estado=20
                    WHERE IdUsuario=@idUsuario AND IdPerfil=@idPerfil AND IdEntrevista=@idEntrevista AND (Estado BETWEEN 10 AND 19);`;

        connection.on('connect', function(err) {
            if (err) {
                reject(err);
            } else {
                request = new Request(query, function(err, rowCount, rows) {
                    if (err) {
                        reject(err);
                    }
                    connection.close();
                });

                request.addParameter('idUsuario', TYPES.Int, idUsuario);
                request.addParameter('idPerfil', TYPES.Int, idPerfil);
                request.addParameter('idEntrevista', TYPES.Int, idEntrevista);
                
                request.on('requestCompleted', function () {
                    resolve(null);
                });

                connection.execSql(request);
            }
        });
    });
}
