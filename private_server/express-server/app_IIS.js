const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const routes = require('./routes/index');
const errorHandler = require('./handlers/errorHandler');
const { logger, expressLogger, expressErrorLogger } = require('./helpers/winston');

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

// Ruta no encontrada: tratamiento del error
app.use(errorHandler.errorHandler);

app.listen(process.env.PORT, function() {
    logger.info('servidor.IIS.iniciado.puerto.' + server.address().port);
});
