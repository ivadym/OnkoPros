const express = require('express');
const https = require('https');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');

const routes = require('./routes/index');
const errorHandler = require('./handlers/errorHandler');
const config = require('./config');
const { logger, expressLogger, expressErrorLogger } = require('./helpers/logger');

// Creación de la aplicación de Express
const app = express();

// Toma las peticiones y las convierte en propiedades utilizables por req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS
app.use(cors());

// Express logger
app.use(expressLogger);

// Tratamiento de las rutas
app.use('/', routes);

// Express error logger (DESPUÉS de cargar las rutas y ANTES del tratamiento de errores)
app.use(expressErrorLogger);

// Tratamiento de los errores
app.use(errorHandler.errorHandler);

var options = {
    cert: fs.readFileSync(config.app.cert),
    key: fs.readFileSync(config.app.key)
};

var server = null;

if (config.app.port != 443) { // Entorno de desarrollo (HTTP)
    server = app.listen(config.app.port, function() {
        logger.info('servidor.iniciado.puerto.' + config.app.port);
    });
} else { // Producción (HTTPS)
    server = https.createServer(options, app);
    server.listen(config.app.port, function() {
        logger.info('servidor.iniciado.puerto.' + config.app.port);
    });
}

server.timeout = 5000;
