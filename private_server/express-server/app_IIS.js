const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const routes = require('./routes/index');
const errorHandlers = require('./handlers/errorHandler');

// Creación de la aplicación de Express
const app = express();

// Toma las peticiones y las convierte en propiedades utilizables por req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS
app.use(cors());

// Tratamiento de las rutas
app.use('/', routes);

// Ruta no encontrada: tratamiento del error
app.use(errorHandlers.notFound);

app.listen(process.env.PORT);
