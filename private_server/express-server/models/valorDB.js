const Connection = require('tedious').Connection;
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;

const config = require('./config');

/**
 * Guarda la respuesta del usuario
 */
exports.setItemValor = function(idUsuario, item) {
    return new Promise(function(resolve, reject) {
        // TODO:
        // Guardar valor/es respondido/s (campo texto)
        
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
                    actualizarEstadoEntrevista(idUsuario, item)
                    .then(function(res) {
                        resolve(res);
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
