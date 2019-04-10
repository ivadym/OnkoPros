const Connection = require('tedious').Connection;
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;

const config = require('./config');

/**
 * Devuvelve la siguiente pregunta asociada a la entrevista con ID: id
 */
exports.getItem = function(idUsuario, idEntrevista, itemPadre) {
    return new Promise(function(resolve, reject) {
        var connection = new Connection(config.auth);
        var query = `SELECT TOP 1 i.IdItem, e.IdEntrevista, i.Titulo, i.Tooltip, i.TipoItem, i.EsPadre, i.IdEntrevistaPadre
                    FROM OP_ENTREVISTA e INNER JOIN GEOP_ENTREVISTA eg ON e.IdEntrevista=eg.IdEntrevista
                    INNER JOIN GEOP_ENTREVISTA_ITEM ei ON e.IdEntrevista=ei.IdEntrevista
                    INNER JOIN GEOP_ITEM i ON ei.IdItem=i.IdItem
                    WHERE e.IdUsuario=@idUsuario AND e.IdEntrevista=@idEntrevista AND i.IdItem NOT IN (SELECT IdItem FROM OP_ENTREVISTA_ITEM) AND (e.Estado BETWEEN 0 AND 19) AND eg.Estado=1 AND ei.Estado=1 AND i.Estado=1 AND (@fechaActual BETWEEN e.FechaInicio AND e.FechaLimite)
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
                        if(siguienteItem.EsPadre) { // El item extraído es padre
                            exports.getItem(idUsuario, siguienteItem.IdEntrevistaPadre, siguienteItem) // Búsquedad de hijos
                            .then(function(res) {                                    
                                if(res) { // Quedan items
                                    resolve(res); // Se envía el item al usuario
                                } else { // NO hay más items asignados al item padre
                                    exports.getItem(idUsuario, idEntrevista, null) // Búsqueda de hijos (entrevista principal)
                                    .then(function(res) {
                                        resolve(res);
                                    })
                                    .catch(function(error) {
                                        reject(error);
                                    });
                                }
                            })
                            .catch(function(error) {
                                resolve(error);
                            });
                        } else { // El item extraído NO es padre
                            getValor(idUsuario, siguienteItem) // Se obtienen los valores del item correspondiente
                            .then(function(res) {
                                siguienteItem.Valores = res;
                                delete siguienteItem['EsPadre'];
                                delete siguienteItem['IdEntrevistaPadre'];
                                resolve(siguienteItem); // Se envía al usuario/padre el item
                            })
                            .catch(function(error) {
                                resolve(error);
                            });
                        }
                    } else { // NO hay más items
                        if(itemPadre) { // Item asociado a un padre
                            finalizarItemPadre(idUsuario, itemPadre) // Se cambia el estado del item padre a RESPONDIDO
                            .then(function(res) {
                                resolve(res); // Se devuelve un null (no hay más items para este item padre)
                            })
                            .catch(function(error) {
                                resolve(error);
                            });
                        } else { // Item NO asociado a un padre
                            finalizarEntrevista(idUsuario, idEntrevista) // Se cambia el estado de la entrevista a REALIZADA
                            .then(function(res) {
                                resolve(res); // Se envía al usuario un null (no hay más items para esta entrevista)
                            })
                            .catch(function(error) {
                                resolve(error);
                            });
                        }
                    }
                });

                connection.execSql(request);
            }
        });
    });
}

/**
 * Devuelve los valores asociados a un item determinado
 */
function getValor(idUsuario, item) {
    return new Promise(function(resolve, reject) {
        var connection = new Connection(config.auth);
        var query = `SELECT v.IdItemValor, v.Titulo, v.Tooltip, v.Valor, v.TipoValor, v.VisibleValor, v.Alerta, v.AlertaTexto
                    FROM OP_ENTREVISTA e INNER JOIN GEOP_ENTREVISTA eg ON e.IdEntrevista=eg.IdEntrevista
                    INNER JOIN GEOP_ENTREVISTA_ITEM ei ON e.IdEntrevista=ei.IdEntrevista
                    INNER JOIN GEOP_ITEM i ON ei.IdItem=i.IdItem
                    INNER JOIN GEOP_ITEM_VALOR v ON i.IdItem=v.IdItem
                    WHERE e.IdUsuario=@idUsuario AND e.IdEntrevista=@idEntrevista AND i.IdItem=@idItem AND (e.Estado BETWEEN 0 AND 19) AND eg.Estado=1 AND ei.Estado=1 AND i.Estado=1 AND v.Estado=1 AND (@fechaActual BETWEEN e.FechaInicio AND e.FechaLimite)
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

                request.addParameter('idUsuario', TYPES.Int, idUsuario);
                request.addParameter('idEntrevista', TYPES.Int, item.IdEntrevista);
                request.addParameter('idItem', TYPES.Int, item.IdItem);
                request.addParameter('fechaActual', TYPES.Date, new Date());
                
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
 * Finaliza la entrevista correspondiente al ID: id (entrevista finalizada)
 */
function finalizarItemPadre(idUsuario, itemPadre) {
    return new Promise(function(resolve, reject) {
        var connection = new Connection(config.auth);
        var query = `INSERT INTO OP_ENTREVISTA_ITEM (IdEntrevistaItem, IdEntrevistaUsuario, IdItem, Estado)
                    VALUES ((SELECT ISNULL(MAX(IdEntrevistaItem), 0)+1 FROM OP_ENTREVISTA_ITEM), (SELECT IdEntrevistaUsuario FROM OP_ENTREVISTA WHERE IdUsuario=@idUsuario AND IdEntrevista=@idEntrevista), @idItem, 1);`;

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
                request.addParameter('idEntrevista', TYPES.Int, itemPadre.IdEntrevista);
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
 * Finaliza la entrevista al no quedar más items
 */
function finalizarEntrevista(idUsuario, idEntrevista) {
    return new Promise(function(resolve, reject) {
        var connection = new Connection(config.auth);
        var query = `UPDATE OP_ENTREVISTA
                    SET Estado=20
                    WHERE IdUsuario=@idUsuario AND IdEntrevista=@idEntrevista;`;

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
                request.addParameter('idEntrevista', TYPES.Int, idEntrevista);
                
                request.on('requestCompleted', function () {
                    resolve(null);
                });

                connection.execSql(request);
            }
        });
    });
}
