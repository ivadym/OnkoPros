const ConnectionPool = require('tedious-connection-pool');

const configDB = require('../config/database');

/**
 * Define una nueva conexión entre la base de datos y el módulo tedious
 */
function conexionPool() {
    return new ConnectionPool(configDB.pool, configDB.auth);
}

/**
 * Adapta los perfiles de usuario extraídos de la BBDD para su presentación
 */
function adaptarPerfilUsuario(usuarios) {
    var perfiles = [];
    for (var i = 0; i < usuarios.length; i++) {
        switch (usuarios[i].IdPerfil) {
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
 * Adapta el perfil de usuario a su estructura en la BBDD
 */
function adaptarPerfilSql(perfil) {
    switch (perfil) {
        case 'Administrador':
            return 0;
        case 'Profesional de la salud':
            return 1;
        case 'Paciente':
            return 2;
    }
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

module.exports = { adaptarPerfilUsuario, adaptarPerfilSql, adaptarSexo, conexionPool }
