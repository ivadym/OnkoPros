const ConnectionPool = require('tedious-connection-pool');

/**
 * Credenciales de accesso a la base de datos especificada
 */
const auth = {
    userName: 'OKImpetusUser',
    password: 'p9Kju7t@8Tn',
    server: 'SRVKIRO',
    options: {
        encrypt: true,
        database: 'ONKOIMPETUS',
        dateFormat: 'ymd',
        connectTimeout: '10000', // The number of milliseconds before the attempt to connect is considered failed
        requestTimeout: '10000', // The number of milliseconds before a request is considered failed, or 0 for no timeout
        cancelTimeout: '5000' // The number of milliseconds before the cancel (abort) of a request is considered failed
    }
}

/**
 * Configuración de la agrupación de conexiones
 */
const pool = {
    min: 1,
    max: 10,
    log: false
};

/**
 * Define una nueva conexión entre la base de datos y el módulo tedious
 */
function conexionPool() {
    return new ConnectionPool(pool, auth);
}

module.exports = { auth, pool, conexionPool }
