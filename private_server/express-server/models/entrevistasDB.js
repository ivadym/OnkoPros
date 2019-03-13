const Connection = require('tedious').Connection;
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;

const config = require('./config');


/**
 * Devuelve las entrevistas disponibles
 */
exports.getEntrevistas = function () {
    return new Promise(function(resolve, reject) {
        var connection = new Connection(config.auth);
        var fecha_actual = new Date();
        var query = `SELECT * FROM GEOP_ENTREVISTA WHERE activo='true' AND fecha_limite>=@fecha_actual ORDER BY fecha_limite ASC;`;
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

                request.addParameter('fecha_actual', TYPES.Date, fecha_actual);

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
 * Devuelve la entrevista asociada al ID: id
 */
exports.getEntrevista = function (id) {
    return new Promise(function(resolve, reject) {
        var connection = new Connection(config.auth);
        var fecha_actual = new Date();
        var query = `SELECT * FROM GEOP_ENTREVISTA WHERE id=@id AND activo='true' AND fecha_limite>=@fecha_actual;`;
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

                request.addParameter('id', TYPES.Int, id);
                request.addParameter('fecha_actual', TYPES.Date, fecha_actual);

                request.on('row', function(columns) {
                    var rowObject = {};
                    columns.forEach(function(column) {
                        rowObject[column.metadata.colName] = column.value;
                    });
                    result.push(rowObject);
                });
                
                request.on('requestCompleted', function () {
                    resolve(result[0]);
                });

                connection.execSql(request);
            }
        });
    });
}
