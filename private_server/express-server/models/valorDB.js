const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;

/**
 * Extrae los valores asociados a un item determinado
 */
function extraerValores(pool, item) {
    var query = `SELECT v.IdValor, v.Titulo, v.Seleccionado, v.Valor, v.TipoValor, v.VisibleValor, v.CajaTexto, v.ValorTexto, v.Alerta
                FROM GEOP_ITEM i INNER JOIN GEOP_ITEM_VALOR iv ON iv.IdItem=i.IdItem
                INNER JOIN GEOP_VALOR v ON v.IdValor=iv.IdValor
                WHERE i.IdItem=@idItem AND i.Estado=1 AND i.EsAgrupacion=0 AND iv.Estado=1 AND v.Estado=1
                ORDER BY CAST(iv.Orden AS numeric) ASC;`;
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
function extraerIdValoresRespondidos(pool, idEntrevistaItem) {
    var query = `SELECT eiv.IdValor, eiv.ValorTexto
                FROM OP_ENTREVISTA_ITEM_VALOR eiv WHERE eiv.IdEntrevistaItem=@idEntrevistaItem AND eiv.Estado=1;`;
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
                
                request.addParameter('idEntrevistaItem', TYPES.Int, idEntrevistaItem);
                
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
function almacenarValor(pool, idEntrevistaItem, item, index) {
    var query = `INSERT INTO OP_ENTREVISTA_ITEM_VALOR (IdEntrevistaItemValor, IdEntrevistaItem, IdValor, Estado, ValorTexto)
                VALUES ((SELECT ISNULL(MAX(IdEntrevistaItemValor), 0)+1 FROM OP_ENTREVISTA_ITEM_VALOR), @idEntrevistaItem, @idValor, 1, @valorTexto);`;

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
                request.addParameter('idValor', TYPES.Int, item.Valores[index].IdValor);
                request.addParameter('valorTexto', TYPES.NVarChar, item.Valores[index].ValorTexto);
                
                request.on('requestCompleted', function() {
                    if (item.Valores[++index]) {
                        return almacenarValor(pool, idEntrevistaItem, item, index)
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
function eliminarValores(pool, idEntrevistaItem, item) {
    var query = `DELETE op_eiv
                FROM OP_ENTREVISTA_ITEM_VALOR op_eiv
                WHERE op_eiv.IdEntrevistaItem=@idEntrevistaItem AND op_eiv.Estado=1;`;

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
                    resolve(item);
                });

                connection.execSql(request);
            }
        });
    });
}

module.exports = { extraerValores, extraerIdValoresRespondidos, almacenarValor, eliminarValores }
