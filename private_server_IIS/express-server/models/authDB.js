const Connection = require('tedious').Connection;
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;

const config = require('./config');

/**
 * Comprueba las credenciales de usuario
 */
exports.checkCredenciales = function (usuario, clave) {
    return new Promise(function(resolve, reject) {
        var connection = new Connection(config.auth);
        var query = `SELECT * FROM GEOP_USUARIO WHERE usuario=@usuario AND clave=@clave AND activo='true';`;
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

                request.addParameter('usuario', TYPES.VarChar, usuario);
                request.addParameter('clave', TYPES.VarChar, clave);

                request.on('row', function(columns) {
                    var rowObject = {};
                    columns.forEach(function(column) {
                        rowObject[column.metadata.colName] = column.value;
                    });
                    result.push(rowObject);
                });
                
                request.on('requestCompleted', function () {
                    if(result[0]) {
                        delete result[0].clave;
                        resolve(result[0]);
                    } else {
                        resolve(null);
                    }
                    
                });

                connection.execSql(request);
            }
        });
    });
}
