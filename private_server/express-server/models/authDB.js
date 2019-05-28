const Connection = require('tedious').Connection;
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;

const config = require('../config/authSQL');
const helpers = require('../helpers/helpers');

/**
 * Comprueba las credenciales de usuario recibidas
 */
function comprobarCredenciales(usuario, clave) {
    return new Promise(function(resolve, reject) {
        var connection = new Connection(config.auth);
        var query = `SELECT u.IdUsuario, up.IdPerfil, u.Usuario, u.Nombre, u.PrimerApellido, u.SegundoApellido, u.Sexo,  u.FechaNacimiento, u.Telefono, u.Email
                    FROM GEOP_USUARIO u INNER JOIN GEOP_USUARIO_PERFIL up ON u.IdUsuario=up.IdUsuario
                    WHERE u.Usuario=@usuario AND u.Clave=@clave AND up.Estado=1;`;
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
                
                request.on('requestCompleted', function() {
                    if (result[0]) {
                        result[0].Perfil = helpers.adaptarPerfilUsuario(result);
                        delete result[0]['IdPerfil'];
                        result[0].Sexo = helpers.adaptarSexo(result[0].Sexo);
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

module.exports = { comprobarCredenciales }
