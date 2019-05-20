const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const routes = require('./routes/index');

// Creación de la aplicación de Express
const app = express();

// Toma las peticiones y las convierte en propiedades utilizables por req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS
app.use(cors());

// Tratamiento de las rutas
app.use('/', routes);

const server = app.listen(8080, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Servidor iniciado en http://%s:%s', host, port);
});
