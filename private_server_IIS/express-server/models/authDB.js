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
        var query = `SELECT u.IdUsuario, up.Perfil, u.Usuario, u.Nombre, u.PrimerApellido, u.SegundoApellido, u.Sexo,  u.FechaNacimiento, u.Telefono, u.Email
                    FROM GEOP_USUARIO u INNER JOIN GEOP_USUARIO_PERFIL up
                    ON u.Usuario=@usuario AND u.Clave=@clave AND u.IdUsuario=up.IdUsuario AND up.Estado=1;`
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
                        result[0].Perfil = adaptarPerfiles(result);
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

/**
 * Adapta los perfiles extraídos de la BBDD para su presentación
 */
function adaptarPerfiles(usuarios) {
    var perfiles = [];
    for (var i = 0; i < usuarios.length; i++) {
        switch (usuarios[i].Perfil) {
            case 0:
                perfiles.push('Administrador');
                break; 
            case 1:
                perfiles.push('Profesional de la salud');
                break; 
            case 2:
                perfiles.push('Paciente');
                break; 
        }
    }
    return perfiles;
}

/**
 * Adapta los sexos de los usuarios extraídos de la BBDD para su presentación
 */
function adaptarSexo(sexo) {
    switch (sexo) {
        case 0:
            return 'Desconocido';
        case 1:
            return 'Hombre';
        case 2:
            return 'Mujer';
        case 9:
            return 'No aplicable'
    }
}
