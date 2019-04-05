const Connection = require('tedious').Connection;
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;

const config = require('./config');

/**
 * Guarda la respuesta del usuario
 */
exports.setValor = function(valor) {
    return new Promise(function(resolve, reject) {
        var connection = new Connection(config.auth);
        
        var query = `INSERT INTO GEOP_VALOR VALUES(@id, @titulo, @tipo, @valor_0, @valor_1, @valor_2, @valor_3);`;

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
                
                request.addParameter('id',      TYPES.Int,      valor.id);
                request.addParameter('titulo',  TYPES.VarChar,  valor.titulo);
                request.addParameter('tipo',    TYPES.VarChar,  valor.tipo);
                request.addParameter('valor_0', TYPES.VarChar,  valor.valores[0]);
                request.addParameter('valor_1', TYPES.VarChar,  valor.valores[1]);
                request.addParameter('valor_2', TYPES.VarChar,  valor.valores[2]);
                request.addParameter('valor_3', TYPES.VarChar,  valor.valores[3]);

                request.on('requestCompleted', function () {
                    desactivarItem(valor.id)
                    .then(function(res) {
                        if(res) {
                            resolve(valor);
                        } else {
                            reject();
                        }
                    })
                    .catch(function(error) {
                        reject(error);
                    });
                });

                connection.execSql(request);
            }
        });
    });
}

/**
 * Desactiva la pregunta correspondiente al ID: id
 */
function desactivarItem(id) {
    return new Promise(function(resolve, reject) {
        var connection = new Connection(config.auth);
        var query = `UPDATE GEOP_ITEM SET activo=0 WHERE id=@id;`;

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

                request.addParameter('id', TYPES.Int, id);
                
                request.on('requestCompleted', function () {
                    resolve(true);
                });

                connection.execSql(request);
            }
        });
    });    
}
