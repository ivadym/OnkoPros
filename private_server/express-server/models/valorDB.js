const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;

/**
 * Extrae los valores asociados a un item determinado
 */
function extraerValores(pool, item) {
    return new Promise(function(resolve, reject) {
        var query = `SELECT v.IdValor, v.Titulo, v.Seleccionado, v.Valor, v.TipoValor, v.VisibleValor, v.CajaTexto, v.ValorTexto, v.Alerta
                    FROM GEOP_ITEM i INNER JOIN GEOP_ITEM_VALOR iv ON i.IdItem=iv.IdItem
                    INNER JOIN GEOP_VALOR v ON iv.IdValor=v.IdValor
                    WHERE i.IdItem=@idItem AND i.Estado=1 AND i.EsAgrupacion=0 AND iv.Estado=1 AND v.Estado=1
                    ORDER BY len(iv.Orden), iv.Orden ASC;`;
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

                request.addParameter('idItem', TYPES.Int, item.IdItem);

                request.on('row', function(columns) {
                    var rowObject = {};
                    columns.forEach(function(column) {
                        rowObject[column.metadata.colName] = column.value;
                    });
                    result.push(rowObject);
                });

                request.on('requestCompleted', function() {
                    if (result.length > 0) {
                        resolve(result);
                    } else {
                        reject('Error en la extracción de los valores asociados a un item determinado');
                    }
                });

                connection.execSql(request);
            }
        });
    });
}

/**
 * Devuelve un array con los valores contestados anteriormente
 */
function extraerIdValoresRespondidos(pool, idUsuario, idPerfil, idEntrevista, idItem) {
    return new Promise(function(resolve, reject) {
        var query = `SELECT eiv.IdValor, eiv.ValorTexto
                    FROM OP_ENTREVISTA e INNER JOIN OP_ENTREVISTA_ITEM ei ON e.IdEntrevistaUsuario=ei.IdEntrevistaUsuario
                    INNER JOIN OP_ENTREVISTA_ITEM_VALOR eiv ON ei.IdEntrevistaItem=eiv.IdEntrevistaItem
                    WHERE e.IdUsuario=@idUsuario AND e.IdPerfil=@idPerfil AND e.IdEntrevista=@idEntrevista AND ei.IdItem=@idItem AND (e.Estado BETWEEN 10 AND 19) AND ei.Estado=1 AND eiv.Estado=1;`;
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
                    if (result.length > 0) {
                        resolve(result);
                    } else {
                        reject('Error en la obtención de los valores respondidos previamente por el usuario');
                    }
                });

                connection.execSql(request);
            }
        });
    });
}

/**
 * Almacenar los valores contestados por el usuario
 */
function almacenarValor(pool, idUsuario, idPerfil, item, index) {
    return new Promise(function(resolve, reject) {
        var query = `INSERT INTO OP_ENTREVISTA_ITEM_VALOR (IdEntrevistaItemValor, IdEntrevistaItem, IdValor, Estado, ValorTexto)
                    VALUES ((SELECT ISNULL(MAX(IdEntrevistaItemValor), 0)+1 FROM OP_ENTREVISTA_ITEM_VALOR),
                    (SELECT IdEntrevistaItem FROM OP_ENTREVISTA_ITEM op_ei WHERE op_ei.IdItem=@idItem AND op_ei.Estado=1 AND op_ei.IdEntrevistaUsuario=(SELECT IdEntrevistaUsuario FROM OP_ENTREVISTA WHERE IdUsuario=@idUsuario AND IdPerfil=@idPerfil AND IdEntrevista=@idEntrevista AND (Estado BETWEEN 0 AND 19))), @idValor, 1, @valorTexto);`;

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
                request.addParameter('idValor', TYPES.Int, item.Valores[index].IdValor);
                request.addParameter('valorTexto', TYPES.NVarChar, item.Valores[index].ValorTexto);
                
                request.on('requestCompleted', function() {
                    if (item.Valores[++index]) {
                        return almacenarValor(pool, idUsuario, idPerfil, item, index)
                        .then(function(res) {
                            resolve(res);
                        })
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
 * Elimina los valores contestados previamente por el usuario
 */
function eliminarValores(pool, idUsuario, idPerfil, item) {
    return new Promise(function(resolve, reject) {
        var query = `DELETE eiv
                    FROM OP_ENTREVISTA_ITEM_VALOR eiv 
                    INNER JOIN OP_ENTREVISTA_ITEM ei ON ei.IdEntrevistaItem=eiv.IdEntrevistaItem
                    WHERE ei.IdItem=@idItem AND ei.IdEntrevistaUsuario=(SELECT IdEntrevistaUsuario FROM OP_ENTREVISTA WHERE IdUsuario=@idUsuario AND IdPerfil=@idPerfil AND IdEntrevista=@idEntrevista AND (Estado BETWEEN 10 AND 19)) AND eiv.Estado=1 AND ei.Estado=1;`;

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
                    resolve(item);
                });

                connection.execSql(request);
            }
        });
    });
}

module.exports = { extraerValores, extraerIdValoresRespondidos, almacenarValor, eliminarValores }
