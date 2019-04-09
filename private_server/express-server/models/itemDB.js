const Connection = require('tedious').Connection;
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;

const config = require('./config');

/**
 * Devuvelve la siguiente pregunta asociada a la entrevista con ID: id
 */
exports.getItem = function(idUsuario, idEntrevista) {
    return new Promise(function(resolve, reject) {
        var connection = new Connection(config.auth);
        var query = `SELECT TOP 1 e.IdEntrevistaUsuario, i.IdItem, e.IdEntrevista, i.Titulo, i.Tooltip, i.TipoItem
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
                       getValor(idUsuario, siguienteItem)
                       .then(function(res) {
                        if(res) {
                            siguienteItem.Valores = res;
                            resolve(siguienteItem);
                        } else {
                            reject();
                        }
                       })
                       .catch(function(error) {ç
                            reject(error);
                        });
                    } else { // Entrevista finalizada
                        desactivarEntrevista(idUsuario, idEntrevista)
                        .then(function(res) {
                            if(res) {
                                resolve();
                            } else {
                                reject();
                            }
                        })
                        .catch(function(error) {
                            reject(error);
                        });
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
                    if(result) {
                        resolve(result);
                    } else {
                        reject();
                    }
                });

                connection.execSql(request);
            }
        });
    });

}

/**
 * Desactiva la entrevista correspondiente al ID: id (entrevista finalizada)
 */
function desactivarEntrevista(idUsuario, idEntrevista) {
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
                    resolve(true);
                });

                connection.execSql(request);
            }
        });
    });
}
