const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;

const { adaptarPerfilUsuario, adaptarSexo } = require('../helpers/adaptador');

/**
 * Comprueba las credenciales de usuario recibidas
 */
function comprobarCredenciales(pool, usuario, clave) {
    var query = `SELECT u.IdUsuario, up.IdPerfil, u.Usuario, u.Nombre, u.PrimerApellido, u.SegundoApellido, u.Sexo,  u.FechaNacimiento, u.Telefono, u.Email
                FROM GEOP_USUARIO u INNER JOIN GEOP_USUARIO_PERFIL up ON up.IdUsuario=u.IdUsuario
                WHERE u.Usuario=@usuario AND u.Clave=@clave AND up.Estado=1;`;
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
                        result[0].Perfil = adaptarPerfilUsuario(result);
                        delete result[0]['IdPerfil'];
                        result[0].Sexo = adaptarSexo(result[0].Sexo);
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
