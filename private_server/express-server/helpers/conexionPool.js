const ConnectionPool = require('tedious-connection-pool');

const config = require('../config')

/**
 * Define una nueva conexión entre la base de datos y el módulo tedious
 */
function conexionPool() {
    return new ConnectionPool(config.conexionPool, config.db);
}

module.exports = { conexionPool }
