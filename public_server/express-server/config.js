require('dotenv').config({ path: __dirname + '/config.env' })

const env = process.env.NODE_ENV || 'dev';

const dev = {
    app: {
        port: process.env.PORT || 8080,
        privateServerURL: process.env.PRIVATE_SERVER_URL
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