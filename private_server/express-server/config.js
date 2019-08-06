require('dotenv').config({ path: __dirname + '/config.env' })

const env = process.env.NODE_ENV || 'dev';

const dev = {
    app: {
        port: process.env.PORT || 8080,
        cert: '../../certificados/OKImpetus.crt',
        key: '../../certificados/OKImpetus.rsa'
    },
    db: {
        userName: process.env.DB_USER,
        password: process.env.DB_PASS,
        server: process.env.DB_SERVER,
        options: {
            encrypt: true,
            database: process.env.DB_NAME,
            dateFormat: 'ymd',
            connectTimeout: '10000', // The number of milliseconds before the attempt to connect is considered failed
            requestTimeout: '10000', // The number of milliseconds before a request is considered failed, or 0 for no timeout
            cancelTimeout: '5000' // The number of milliseconds before the cancel (abort) of a request is considered failed
        }
    },
    conexionPool: {
        min: 1,
        max: 10,
        log: false
    },
    logger: {
        activo: true, // true: Logs activos, false: Logs desactivados
        filtroUnico: false, // Imprime los logs únicamente del nivel especificado
        levelConsole: 'info',
        levelFile: 'error',
        filename: __dirname + '/logs/app.log'
    }
};

const config = {
    dev
    // test,
    // prod
};

module.exports = config[env];