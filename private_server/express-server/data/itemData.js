const Connection = require('tedious').Connection;
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;

const config = require('./config');

/**
 * Devuvelve la siguiente pregunta asociada a la entrevista con ID: id
 */
exports.getItem = function(id_entrevista) {
    return new Promise(function(resolve, reject) {
        var connection = new Connection(config.auth);
        var query = `SELECT TOP 1 * FROM GEOP_ITEM WHERE id_entrevista=@id_entrevista AND activo='true';`;
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

                request.addParameter('id_entrevista', TYPES.Int, id_entrevista);

                request.on('row', function(columns) {
                    var rowObject = {};
                    columns.forEach(function(column) {
                        rowObject[column.metadata.colName] = column.value;
                    });
                    result.push(rowObject);
                });
                
                request.on('requestCompleted', function () {
                    resolve(estructurarItem(result));
                });

                connection.execSql(request);
            }
        });
    });
}

/**
 * Estructura la pregunta enviada al lado del cliente
 */
function estructurarItem(result) {
    var valores = [result[0].valor_0, result[0].valor_1, result[0].valor_2, result[0].valor_3];
    return {
        'id': result[0].id,
        'id_entrevista': result[0].id_entrevista,
        'titulo': result[0].titulo,
        'tipo': result[0].tipo,
        'valores': valores,
        'activo': result[0].activo
    }
}
