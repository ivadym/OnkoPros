const Connection = require('tedious').Connection;
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;

const config = require('./config');

/**
 * Guarda la respuesta del usuario
 */
exports.almacenarItemValor = function(idUsuario, item) {
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
                request.addParameter('idEntrevista', TYPES.Int, item.IdEntrevista);
                request.addParameter('idItem', TYPES.Int, item.IdItem);

                request.on('requestCompleted', function () {
                    almacenarValor(idUsuario, item, 0)
                    .then(function(res) {
                        actualizarEstadoEntrevista(idUsuario, res)
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
                });

                connection.execSql(request);
            }
        });
    });
}

/**
 * Actualiza el estado de la entrevista (en progreso)
 */
function almacenarValor(idUsuario, item, index) {
    return new Promise(function(resolve, reject) {
        var connection = new Connection(config.auth);
        var query = `INSERT INTO OP_ENTREVISTA_ITEM_VALOR (IdEntrevistaItemValor, IdEntrevistaItem, IdItemValor, Estado, ValorTexto)
                    VALUES ((SELECT ISNULL(MAX(IdEntrevistaItemValor), 0)+1 FROM OP_ENTREVISTA_ITEM_VALOR), (SELECT IdEntrevistaItem FROM OP_ENTREVISTA_ITEM WHERE IdItem=@idItem AND Estado=1 AND IdEntrevistaUsuario=(SELECT IdEntrevistaUsuario FROM OP_ENTREVISTA WHERE IdUsuario=@idUsuario AND IdEntrevista=@idEntrevista AND (Estado BETWEEN 0 AND 19) AND (@fechaActual BETWEEN FechaInicio AND FechaLimite) )),
                    @idItemValor, 1, @valorTexto)`;

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
                request.addParameter('idItemValor', TYPES.Int, item.Valores[index].IdItemValor);
                request.addParameter('valorTexto', TYPES.NVarChar, item.Valores[index].ValorTexto);
                request.addParameter('fechaActual', TYPES.Date, new Date());
                
                request.on('requestCompleted', function () {
                    if(item.Valores[++index]) {
                        almacenarValor(idUsuario, item, index)
                        .then(function(res) {
                            resolve(res);
                        })
                        .catch(function(error) {
                            resolve(error);
                        });
                    } else {
                        resolve(item);
                    }
                });

                connection.execSql(request);
            }
        });
    });
}

/**
 * Actualiza el estado de la entrevista (en progreso)
 */
function actualizarEstadoEntrevista(idUsuario, item) {
    return new Promise(function(resolve, reject) {
        var connection = new Connection(config.auth);
        var query = `UPDATE OP_ENTREVISTA
                    SET Estado=10
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
                request.addParameter('idEntrevista', TYPES.Int, item.IdEntrevista);
                
                request.on('requestCompleted', function () {
                    resolve(item);
                });

                connection.execSql(request);
            }
        });
    });
}
